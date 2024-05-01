var __TEMPORAL__;
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/activity-options.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/activity-options.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ActivityCancellationType = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.workflow_commands.ActivityCancellationType
var ActivityCancellationType;
(function (ActivityCancellationType) {
    ActivityCancellationType[ActivityCancellationType["TRY_CANCEL"] = 0] = "TRY_CANCEL";
    ActivityCancellationType[ActivityCancellationType["WAIT_CANCELLATION_COMPLETED"] = 1] = "WAIT_CANCELLATION_COMPLETED";
    ActivityCancellationType[ActivityCancellationType["ABANDON"] = 2] = "ABANDON";
})(ActivityCancellationType || (exports.ActivityCancellationType = ActivityCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/data-converter.js":
/*!*************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/data-converter.js ***!
  \*************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultDataConverter = exports.defaultFailureConverter = void 0;
const failure_converter_1 = __webpack_require__(/*! ./failure-converter */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/failure-converter.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-converter.js");
/**
 * The default {@link FailureConverter} used by the SDK.
 *
 * Error messages and stack traces are serizalized as plain text.
 */
exports.defaultFailureConverter = new failure_converter_1.DefaultFailureConverter();
/**
 * A "loaded" data converter that uses the default set of failure and payload converters.
 */
exports.defaultDataConverter = {
    payloadConverter: payload_converter_1.defaultPayloadConverter,
    failureConverter: exports.defaultFailureConverter,
    payloadCodecs: [],
};


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/failure-converter.js":
/*!****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/failure-converter.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DefaultFailureConverter = exports.cutoffStackTrace = void 0;
const failure_1 = __webpack_require__(/*! ../failure */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ../type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
const payload_converter_1 = __webpack_require__(/*! ./payload-converter */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-converter.js");
function combineRegExp(...regexps) {
    return new RegExp(regexps.map((x) => `(?:${x.source})`).join('|'));
}
/**
 * Stack traces will be cutoff when on of these patterns is matched
 */
const CUTOFF_STACK_PATTERNS = combineRegExp(
/** Activity execution */
/\s+at Activity\.execute \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/, 
/** Workflow activation */
/\s+at Activator\.\S+NextHandler \(.*[\\/]workflow[\\/](?:src|lib)[\\/]internals\.[jt]s:\d+:\d+\)/, 
/** Workflow run anything in context */
/\s+at Script\.runInContext \((?:node:vm|vm\.js):\d+:\d+\)/);
/**
 * Any stack trace frames that match any of those wil be dopped.
 * The "null." prefix on some cases is to avoid https://github.com/nodejs/node/issues/42417
 */
const DROPPED_STACK_FRAMES_PATTERNS = combineRegExp(
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?next \(.*[\\/]common[\\/](?:src|lib)[\\/]interceptors\.[jt]s:\d+:\d+\)/, 
/** Internal functions used to recursively chain interceptors */
/\s+at (null\.)?executeNextHandler \(.*[\\/]worker[\\/](?:src|lib)[\\/]activity\.[jt]s:\d+:\d+\)/);
/**
 * Cuts out the framework part of a stack trace, leaving only user code entries
 */
function cutoffStackTrace(stack) {
    const lines = (stack ?? '').split(/\r?\n/);
    const acc = Array();
    for (const line of lines) {
        if (CUTOFF_STACK_PATTERNS.test(line))
            break;
        if (!DROPPED_STACK_FRAMES_PATTERNS.test(line))
            acc.push(line);
    }
    return acc.join('\n');
}
exports.cutoffStackTrace = cutoffStackTrace;
/**
 * Default, cross-language-compatible Failure converter.
 *
 * By default, it will leave error messages and stack traces as plain text. In order to encrypt them, set
 * `encodeCommonAttributes` to `true` in the constructor options and use a {@link PayloadCodec} that can encrypt /
 * decrypt Payloads in your {@link WorkerOptions.dataConverter | Worker} and
 * {@link ClientOptions.dataConverter | Client options}.
 */
class DefaultFailureConverter {
    constructor(options) {
        const { encodeCommonAttributes } = options ?? {};
        this.options = {
            encodeCommonAttributes: encodeCommonAttributes ?? false,
        };
    }
    /**
     * Converts a Failure proto message to a JS Error object.
     *
     * Does not set common properties, that is done in {@link failureToError}.
     */
    failureToErrorInner(failure, payloadConverter) {
        if (failure.applicationFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, failure.applicationFailureInfo.type, Boolean(failure.applicationFailureInfo.nonRetryable), (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.applicationFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.serverFailureInfo) {
            return new failure_1.ServerFailure(failure.message ?? undefined, Boolean(failure.serverFailureInfo.nonRetryable), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.timeoutFailureInfo) {
            return new failure_1.TimeoutFailure(failure.message ?? undefined, (0, payload_converter_1.fromPayloadsAtIndex)(payloadConverter, 0, failure.timeoutFailureInfo.lastHeartbeatDetails?.payloads), failure.timeoutFailureInfo.timeoutType ?? failure_1.TimeoutType.TIMEOUT_TYPE_UNSPECIFIED);
        }
        if (failure.terminatedFailureInfo) {
            return new failure_1.TerminatedFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.canceledFailureInfo) {
            return new failure_1.CancelledFailure(failure.message ?? undefined, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.canceledFailureInfo.details?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.resetWorkflowFailureInfo) {
            return new failure_1.ApplicationFailure(failure.message ?? undefined, 'ResetWorkflow', false, (0, payload_converter_1.arrayFromPayloads)(payloadConverter, failure.resetWorkflowFailureInfo.lastHeartbeatDetails?.payloads), this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.childWorkflowExecutionFailureInfo) {
            const { namespace, workflowType, workflowExecution, retryState } = failure.childWorkflowExecutionFailureInfo;
            if (!(workflowType?.name && workflowExecution)) {
                throw new TypeError('Missing attributes on childWorkflowExecutionFailureInfo');
            }
            return new failure_1.ChildWorkflowFailure(namespace ?? undefined, workflowExecution, workflowType.name, retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        if (failure.activityFailureInfo) {
            if (!failure.activityFailureInfo.activityType?.name) {
                throw new TypeError('Missing activityType?.name on activityFailureInfo');
            }
            return new failure_1.ActivityFailure(failure.message ?? undefined, failure.activityFailureInfo.activityType.name, failure.activityFailureInfo.activityId ?? undefined, failure.activityFailureInfo.retryState ?? failure_1.RetryState.RETRY_STATE_UNSPECIFIED, failure.activityFailureInfo.identity ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
        }
        return new failure_1.TemporalFailure(failure.message ?? undefined, this.optionalFailureToOptionalError(failure.cause, payloadConverter));
    }
    failureToError(failure, payloadConverter) {
        if (failure.encodedAttributes) {
            const attrs = payloadConverter.fromPayload(failure.encodedAttributes);
            // Don't apply encodedAttributes unless they conform to an expected schema
            if (typeof attrs === 'object' && attrs !== null) {
                const { message, stack_trace } = attrs;
                // Avoid mutating the argument
                failure = { ...failure };
                if (typeof message === 'string') {
                    failure.message = message;
                }
                if (typeof stack_trace === 'string') {
                    failure.stackTrace = stack_trace;
                }
            }
        }
        const err = this.failureToErrorInner(failure, payloadConverter);
        err.stack = failure.stackTrace ?? '';
        err.failure = failure;
        return err;
    }
    errorToFailure(err, payloadConverter) {
        const failure = this.errorToFailureInner(err, payloadConverter);
        if (this.options.encodeCommonAttributes) {
            const { message, stackTrace } = failure;
            failure.message = 'Encoded failure';
            failure.stackTrace = '';
            failure.encodedAttributes = payloadConverter.toPayload({ message, stack_trace: stackTrace });
        }
        return failure;
    }
    errorToFailureInner(err, payloadConverter) {
        if (err instanceof failure_1.TemporalFailure) {
            if (err.failure)
                return err.failure;
            const base = {
                message: err.message,
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
                source: failure_1.FAILURE_SOURCE,
            };
            if (err instanceof failure_1.ActivityFailure) {
                return {
                    ...base,
                    activityFailureInfo: {
                        ...err,
                        activityType: { name: err.activityType },
                    },
                };
            }
            if (err instanceof failure_1.ChildWorkflowFailure) {
                return {
                    ...base,
                    childWorkflowExecutionFailureInfo: {
                        ...err,
                        workflowExecution: err.execution,
                        workflowType: { name: err.workflowType },
                    },
                };
            }
            if (err instanceof failure_1.ApplicationFailure) {
                return {
                    ...base,
                    applicationFailureInfo: {
                        type: err.type,
                        nonRetryable: err.nonRetryable,
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.CancelledFailure) {
                return {
                    ...base,
                    canceledFailureInfo: {
                        details: err.details && err.details.length
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, ...err.details) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.TimeoutFailure) {
                return {
                    ...base,
                    timeoutFailureInfo: {
                        timeoutType: err.timeoutType,
                        lastHeartbeatDetails: err.lastHeartbeatDetails
                            ? { payloads: (0, payload_converter_1.toPayloads)(payloadConverter, err.lastHeartbeatDetails) }
                            : undefined,
                    },
                };
            }
            if (err instanceof failure_1.ServerFailure) {
                return {
                    ...base,
                    serverFailureInfo: { nonRetryable: err.nonRetryable },
                };
            }
            if (err instanceof failure_1.TerminatedFailure) {
                return {
                    ...base,
                    terminatedFailureInfo: {},
                };
            }
            // Just a TemporalFailure
            return base;
        }
        const base = {
            source: failure_1.FAILURE_SOURCE,
        };
        if ((0, type_helpers_1.isError)(err)) {
            return {
                ...base,
                message: String(err.message) ?? '',
                stackTrace: cutoffStackTrace(err.stack),
                cause: this.optionalErrorToOptionalFailure(err.cause, payloadConverter),
            };
        }
        const recommendation = ` [A non-Error value was thrown from your code. We recommend throwing Error objects so that we can provide a stack trace]`;
        if (typeof err === 'string') {
            return { ...base, message: err + recommendation };
        }
        if (typeof err === 'object') {
            let message = '';
            try {
                message = JSON.stringify(err);
            }
            catch (_err) {
                message = String(err);
            }
            return { ...base, message: message + recommendation };
        }
        return { ...base, message: String(err) + recommendation };
    }
    /**
     * Converts a Failure proto message to a JS Error object if defined or returns undefined.
     */
    optionalFailureToOptionalError(failure, payloadConverter) {
        return failure ? this.failureToError(failure, payloadConverter) : undefined;
    }
    /**
     * Converts an error to a Failure proto message if defined or returns undefined
     */
    optionalErrorToOptionalFailure(err, payloadConverter) {
        return err ? this.errorToFailure(err, payloadConverter) : undefined;
    }
}
exports.DefaultFailureConverter = DefaultFailureConverter;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-codec.js":
/*!************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-codec.js ***!
  \************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-converter.js":
/*!****************************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-converter.js ***!
  \****************************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.defaultPayloadConverter = exports.DefaultPayloadConverter = exports.searchAttributePayloadConverter = exports.SearchAttributePayloadConverter = exports.JsonPayloadConverter = exports.BinaryPayloadConverter = exports.UndefinedPayloadConverter = exports.CompositePayloadConverter = exports.mapFromPayloads = exports.arrayFromPayloads = exports.fromPayloadsAtIndex = exports.mapToPayloads = exports.toPayloads = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/encoding.js");
const errors_1 = __webpack_require__(/*! ../errors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js");
const types_1 = __webpack_require__(/*! ./types */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/types.js");
/**
 * Implements conversion of a list of values.
 *
 * @param converter
 * @param values JS values to convert to Payloads
 * @return list of {@link Payload}s
 * @throws {@link ValueError} if conversion of the value passed as parameter failed for any
 *     reason.
 */
function toPayloads(converter, ...values) {
    if (values.length === 0) {
        return undefined;
    }
    return values.map((value) => converter.toPayload(value));
}
exports.toPayloads = toPayloads;
/**
 * Run {@link PayloadConverter.toPayload} on each value in the map.
 *
 * @throws {@link ValueError} if conversion of any value in the map fails
 */
function mapToPayloads(converter, map) {
    return Object.fromEntries(Object.entries(map).map(([k, v]) => [k, converter.toPayload(v)]));
}
exports.mapToPayloads = mapToPayloads;
/**
 * Implements conversion of an array of values of different types. Useful for deserializing
 * arguments of function invocations.
 *
 * @param converter
 * @param index index of the value in the payloads
 * @param payloads serialized value to convert to JS values.
 * @return converted JS value
 * @throws {@link PayloadConverterError} if conversion of the data passed as parameter failed for any
 *     reason.
 */
function fromPayloadsAtIndex(converter, index, payloads) {
    // To make adding arguments a backwards compatible change
    if (payloads === undefined || payloads === null || index >= payloads.length) {
        return undefined;
    }
    return converter.fromPayload(payloads[index]);
}
exports.fromPayloadsAtIndex = fromPayloadsAtIndex;
/**
 * Run {@link PayloadConverter.fromPayload} on each value in the array.
 */
function arrayFromPayloads(converter, payloads) {
    if (!payloads) {
        return [];
    }
    return payloads.map((payload) => converter.fromPayload(payload));
}
exports.arrayFromPayloads = arrayFromPayloads;
function mapFromPayloads(converter, map) {
    if (map == null)
        return map;
    return Object.fromEntries(Object.entries(map).map(([k, payload]) => {
        const value = converter.fromPayload(payload);
        return [k, value];
    }));
}
exports.mapFromPayloads = mapFromPayloads;
/**
 * Tries to convert values to {@link Payload}s using the {@link PayloadConverterWithEncoding}s provided to the constructor, in the order provided.
 *
 * Converts Payloads to values based on the `Payload.metadata.encoding` field, which matches the {@link PayloadConverterWithEncoding.encodingType}
 * of the converter that created the Payload.
 */
class CompositePayloadConverter {
    constructor(...converters) {
        this.converterByEncoding = new Map();
        if (converters.length === 0) {
            throw new errors_1.PayloadConverterError('Must provide at least one PayloadConverterWithEncoding');
        }
        this.converters = converters;
        for (const converter of converters) {
            this.converterByEncoding.set(converter.encodingType, converter);
        }
    }
    /**
     * Tries to run `.toPayload(value)` on each converter in the order provided at construction.
     * Returns the first successful result, throws {@link ValueError} if there is no converter that can handle the value.
     */
    toPayload(value) {
        for (const converter of this.converters) {
            const result = converter.toPayload(value);
            if (result !== undefined) {
                return result;
            }
        }
        throw new errors_1.ValueError(`Unable to convert ${value} to payload`);
    }
    /**
     * Run {@link PayloadConverterWithEncoding.fromPayload} based on the `encoding` metadata of the {@link Payload}.
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const encoding = (0, encoding_1.decode)(payload.metadata[types_1.METADATA_ENCODING_KEY]);
        const converter = this.converterByEncoding.get(encoding);
        if (converter === undefined) {
            throw new errors_1.ValueError(`Unknown encoding: ${encoding}`);
        }
        return converter.fromPayload(payload);
    }
}
exports.CompositePayloadConverter = CompositePayloadConverter;
/**
 * Converts between JS undefined and NULL Payload
 */
class UndefinedPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_NULL;
    }
    toPayload(value) {
        if (value !== undefined) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_NULL,
            },
        };
    }
    fromPayload(_content) {
        return undefined; // Just return undefined
    }
}
exports.UndefinedPayloadConverter = UndefinedPayloadConverter;
/**
 * Converts between binary data types and RAW Payload
 */
class BinaryPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_RAW;
    }
    toPayload(value) {
        if (!(value instanceof Uint8Array)) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_RAW,
            },
            data: value,
        };
    }
    fromPayload(content) {
        return (
        // Wrap with Uint8Array from this context to ensure `instanceof` works
        (content.data ? new Uint8Array(content.data.buffer, content.data.byteOffset, content.data.length) : content.data));
    }
}
exports.BinaryPayloadConverter = BinaryPayloadConverter;
/**
 * Converts between non-undefined values and serialized JSON Payload
 */
class JsonPayloadConverter {
    constructor() {
        this.encodingType = types_1.encodingTypes.METADATA_ENCODING_JSON;
    }
    toPayload(value) {
        if (value === undefined) {
            return undefined;
        }
        let json;
        try {
            json = JSON.stringify(value);
        }
        catch (err) {
            return undefined;
        }
        return {
            metadata: {
                [types_1.METADATA_ENCODING_KEY]: types_1.encodingKeys.METADATA_ENCODING_JSON,
            },
            data: (0, encoding_1.encode)(json),
        };
    }
    fromPayload(content) {
        if (content.data === undefined || content.data === null) {
            throw new errors_1.ValueError('Got payload with no data');
        }
        return JSON.parse((0, encoding_1.decode)(content.data));
    }
}
exports.JsonPayloadConverter = JsonPayloadConverter;
/**
 * Converts Search Attribute values using JsonPayloadConverter
 */
class SearchAttributePayloadConverter {
    constructor() {
        this.jsonConverter = new JsonPayloadConverter();
        this.validNonDateTypes = ['string', 'number', 'boolean'];
    }
    toPayload(values) {
        if (!Array.isArray(values)) {
            throw new errors_1.ValueError(`SearchAttribute value must be an array`);
        }
        if (values.length > 0) {
            const firstValue = values[0];
            const firstType = typeof firstValue;
            if (firstType === 'object') {
                for (const [idx, value] of values.entries()) {
                    if (!(value instanceof Date)) {
                        throw new errors_1.ValueError(`SearchAttribute values must arrays of strings, numbers, booleans, or Dates. The value ${value} at index ${idx} is of type ${typeof value}`);
                    }
                }
            }
            else {
                if (!this.validNonDateTypes.includes(firstType)) {
                    throw new errors_1.ValueError(`SearchAttribute array values must be: string | number | boolean | Date`);
                }
                for (const [idx, value] of values.entries()) {
                    if (typeof value !== firstType) {
                        throw new errors_1.ValueError(`All SearchAttribute array values must be of the same type. The first value ${firstValue} of type ${firstType} doesn't match value ${value} of type ${typeof value} at index ${idx}`);
                    }
                }
            }
        }
        // JSON.stringify takes care of converting Dates to ISO strings
        const ret = this.jsonConverter.toPayload(values);
        if (ret === undefined) {
            throw new errors_1.ValueError('Could not convert search attributes to payloads');
        }
        return ret;
    }
    /**
     * Datetime Search Attribute values are converted to `Date`s
     */
    fromPayload(payload) {
        if (payload.metadata === undefined || payload.metadata === null) {
            throw new errors_1.ValueError('Missing payload metadata');
        }
        const value = this.jsonConverter.fromPayload(payload);
        let arrayWrappedValue = Array.isArray(value) ? value : [value];
        const searchAttributeType = (0, encoding_1.decode)(payload.metadata.type);
        if (searchAttributeType === 'Datetime') {
            arrayWrappedValue = arrayWrappedValue.map((dateString) => new Date(dateString));
        }
        return arrayWrappedValue;
    }
}
exports.SearchAttributePayloadConverter = SearchAttributePayloadConverter;
exports.searchAttributePayloadConverter = new SearchAttributePayloadConverter();
class DefaultPayloadConverter extends CompositePayloadConverter {
    // Match the order used in other SDKs, but exclude Protobuf converters so that the code, including
    // `proto3-json-serializer`, doesn't take space in Workflow bundles that don't use Protobufs. To use Protobufs, use
    // {@link DefaultPayloadConverterWithProtobufs}.
    //
    // Go SDK:
    // https://github.com/temporalio/sdk-go/blob/5e5645f0c550dcf717c095ae32c76a7087d2e985/converter/default_data_converter.go#L28
    constructor() {
        super(new UndefinedPayloadConverter(), new BinaryPayloadConverter(), new JsonPayloadConverter());
    }
}
exports.DefaultPayloadConverter = DefaultPayloadConverter;
/**
 * The default {@link PayloadConverter} used by the SDK. Supports `Uint8Array` and JSON serializables (so if
 * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description | `JSON.stringify(yourArgOrRetval)`}
 * works, the default payload converter will work).
 *
 * To also support Protobufs, create a custom payload converter with {@link DefaultPayloadConverter}:
 *
 * `const myConverter = new DefaultPayloadConverter({ protobufRoot })`
 */
exports.defaultPayloadConverter = new DefaultPayloadConverter();


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/types.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/types.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.METADATA_MESSAGE_TYPE_KEY = exports.encodingKeys = exports.encodingTypes = exports.METADATA_ENCODING_KEY = void 0;
const encoding_1 = __webpack_require__(/*! ../encoding */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/encoding.js");
exports.METADATA_ENCODING_KEY = 'encoding';
exports.encodingTypes = {
    METADATA_ENCODING_NULL: 'binary/null',
    METADATA_ENCODING_RAW: 'binary/plain',
    METADATA_ENCODING_JSON: 'json/plain',
    METADATA_ENCODING_PROTOBUF_JSON: 'json/protobuf',
    METADATA_ENCODING_PROTOBUF: 'binary/protobuf',
};
exports.encodingKeys = {
    METADATA_ENCODING_NULL: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_NULL),
    METADATA_ENCODING_RAW: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_RAW),
    METADATA_ENCODING_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_JSON),
    METADATA_ENCODING_PROTOBUF_JSON: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF_JSON),
    METADATA_ENCODING_PROTOBUF: (0, encoding_1.encode)(exports.encodingTypes.METADATA_ENCODING_PROTOBUF),
};
exports.METADATA_MESSAGE_TYPE_KEY = 'messageType';


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/deprecated-time.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/deprecated-time.js ***!
  \****************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const time = __importStar(__webpack_require__(/*! ./time */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/time.js"));
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToMs(ts) {
    return time.optionalTsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 *
 * @hidden
 * @deprecated - meant for internal use only
 * @deprecated - meant for internal use only
 */
function tsToMs(ts) {
    return time.tsToMs(ts);
}
exports.tsToMs = tsToMs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msNumberToTs(millis) {
    return time.msNumberToTs(millis);
}
exports.msNumberToTs = msNumberToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToTs(str) {
    return time.msToTs(str);
}
exports.msToTs = msToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToTs(str) {
    return time.msOptionalToTs(str);
}
exports.msOptionalToTs = msOptionalToTs;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msOptionalToNumber(val) {
    return time.msOptionalToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function msToNumber(val) {
    return time.msToNumber(val);
}
exports.msToNumber = msToNumber;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function tsToDate(ts) {
    return time.tsToDate(ts);
}
exports.tsToDate = tsToDate;
/**
 * @hidden
 * @deprecated - meant for internal use only
 */
function optionalTsToDate(ts) {
    return time.optionalTsToDate(ts);
}
exports.optionalTsToDate = optionalTsToDate;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/encoding.js":
/*!*********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/encoding.js ***!
  \*********************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// Pasted with modifications from: https://raw.githubusercontent.com/anonyco/FastestSmallestTextEncoderDecoder/master/EncoderDecoderTogether.src.js
/* eslint no-fallthrough: 0 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decode = exports.encode = exports.TextEncoder = exports.TextDecoder = void 0;
const fromCharCode = String.fromCharCode;
const encoderRegexp = /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g;
const tmpBufferU16 = new Uint16Array(32);
class TextDecoder {
    decode(inputArrayOrBuffer) {
        const inputAs8 = inputArrayOrBuffer instanceof Uint8Array ? inputArrayOrBuffer : new Uint8Array(inputArrayOrBuffer);
        let resultingString = '', tmpStr = '', index = 0, nextEnd = 0, cp0 = 0, codePoint = 0, minBits = 0, cp1 = 0, pos = 0, tmp = -1;
        const len = inputAs8.length | 0;
        const lenMinus32 = (len - 32) | 0;
        // Note that tmp represents the 2nd half of a surrogate pair incase a surrogate gets divided between blocks
        for (; index < len;) {
            nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
            for (; pos < nextEnd; index = (index + 1) | 0, pos = (pos + 1) | 0) {
                cp0 = inputAs8[index] & 0xff;
                switch (cp0 >> 4) {
                    case 15:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        if (cp1 >> 6 !== 0b10 || 0b11110111 < cp0) {
                            index = (index - 1) | 0;
                            break;
                        }
                        codePoint = ((cp0 & 0b111) << 6) | (cp1 & 0b00111111);
                        minBits = 5; // 20 ensures it never passes -> all invalid replacements
                        cp0 = 0x100; //  keep track of th bit size
                    case 14:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b1111) << 6) | (cp1 & 0b00111111);
                        minBits = cp1 >> 6 === 0b10 ? (minBits + 4) | 0 : 24; // 24 ensures it never passes -> all invalid replacements
                        cp0 = (cp0 + 0x100) & 0x300; // keep track of th bit size
                    case 13:
                    case 12:
                        cp1 = inputAs8[(index = (index + 1) | 0)] & 0xff;
                        codePoint <<= 6;
                        codePoint |= ((cp0 & 0b11111) << 6) | (cp1 & 0b00111111);
                        minBits = (minBits + 7) | 0;
                        // Now, process the code point
                        if (index < len && cp1 >> 6 === 0b10 && codePoint >> minBits && codePoint < 0x110000) {
                            cp0 = codePoint;
                            codePoint = (codePoint - 0x10000) | 0;
                            if (0 <= codePoint /*0xffff < codePoint*/) {
                                // BMP code point
                                //nextEnd = nextEnd - 1|0;
                                tmp = ((codePoint >> 10) + 0xd800) | 0; // highSurrogate
                                cp0 = ((codePoint & 0x3ff) + 0xdc00) | 0; // lowSurrogate (will be inserted later in the switch-statement)
                                if (pos < 31) {
                                    // notice 31 instead of 32
                                    tmpBufferU16[pos] = tmp;
                                    pos = (pos + 1) | 0;
                                    tmp = -1;
                                }
                                else {
                                    // else, we are at the end of the inputAs8 and let tmp0 be filled in later on
                                    // NOTE that cp1 is being used as a temporary variable for the swapping of tmp with cp0
                                    cp1 = tmp;
                                    tmp = cp0;
                                    cp0 = cp1;
                                }
                            }
                            else
                                nextEnd = (nextEnd + 1) | 0; // because we are advancing i without advancing pos
                        }
                        else {
                            // invalid code point means replacing the whole thing with null replacement characters
                            cp0 >>= 8;
                            index = (index - cp0 - 1) | 0; // reset index  back to what it was before
                            cp0 = 0xfffd;
                        }
                        // Finally, reset the variables for the next go-around
                        minBits = 0;
                        codePoint = 0;
                        nextEnd = index <= lenMinus32 ? 32 : (len - index) | 0;
                    /*case 11:
                  case 10:
                  case 9:
                  case 8:
                    codePoint ? codePoint = 0 : cp0 = 0xfffd; // fill with invalid replacement character
                  case 7:
                  case 6:
                  case 5:
                  case 4:
                  case 3:
                  case 2:
                  case 1:
                  case 0:
                    tmpBufferU16[pos] = cp0;
                    continue;*/
                    default: // fill with invalid replacement character
                        tmpBufferU16[pos] = cp0;
                        continue;
                    case 11:
                    case 10:
                    case 9:
                    case 8:
                }
                tmpBufferU16[pos] = 0xfffd; // fill with invalid replacement character
            }
            tmpStr += fromCharCode(tmpBufferU16[0], tmpBufferU16[1], tmpBufferU16[2], tmpBufferU16[3], tmpBufferU16[4], tmpBufferU16[5], tmpBufferU16[6], tmpBufferU16[7], tmpBufferU16[8], tmpBufferU16[9], tmpBufferU16[10], tmpBufferU16[11], tmpBufferU16[12], tmpBufferU16[13], tmpBufferU16[14], tmpBufferU16[15], tmpBufferU16[16], tmpBufferU16[17], tmpBufferU16[18], tmpBufferU16[19], tmpBufferU16[20], tmpBufferU16[21], tmpBufferU16[22], tmpBufferU16[23], tmpBufferU16[24], tmpBufferU16[25], tmpBufferU16[26], tmpBufferU16[27], tmpBufferU16[28], tmpBufferU16[29], tmpBufferU16[30], tmpBufferU16[31]);
            if (pos < 32)
                tmpStr = tmpStr.slice(0, (pos - 32) | 0); //-(32-pos));
            if (index < len) {
                //fromCharCode.apply(0, tmpBufferU16 : Uint8Array ?  tmpBufferU16.subarray(0,pos) : tmpBufferU16.slice(0,pos));
                tmpBufferU16[0] = tmp;
                pos = ~tmp >>> 31; //tmp !== -1 ? 1 : 0;
                tmp = -1;
                if (tmpStr.length < resultingString.length)
                    continue;
            }
            else if (tmp !== -1) {
                tmpStr += fromCharCode(tmp);
            }
            resultingString += tmpStr;
            tmpStr = '';
        }
        return resultingString;
    }
}
exports.TextDecoder = TextDecoder;
//////////////////////////////////////////////////////////////////////////////////////
function encoderReplacer(nonAsciiChars) {
    // make the UTF string into a binary UTF-8 encoded string
    let point = nonAsciiChars.charCodeAt(0) | 0;
    if (0xd800 <= point) {
        if (point <= 0xdbff) {
            const nextcode = nonAsciiChars.charCodeAt(1) | 0; // defaults to 0 when NaN, causing null replacement character
            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                if (point > 0xffff)
                    return fromCharCode((0x1e /*0b11110*/ << 3) | (point >> 18), (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
            }
            else
                point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
        else if (point <= 0xdfff) {
            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
        }
    }
    /*if (point <= 0x007f) return nonAsciiChars;
    else */ if (point <= 0x07ff) {
        return fromCharCode((0x6 << 5) | (point >> 6), (0x2 << 6) | (point & 0x3f));
    }
    else
        return fromCharCode((0xe /*0b1110*/ << 4) | (point >> 12), (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/, (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/);
}
class TextEncoder {
    encode(inputString) {
        // 0xc0 => 0b11000000; 0xff => 0b11111111; 0xc0-0xff => 0b11xxxxxx
        // 0x80 => 0b10000000; 0xbf => 0b10111111; 0x80-0xbf => 0b10xxxxxx
        const encodedString = inputString === void 0 ? '' : '' + inputString, len = encodedString.length | 0;
        let result = new Uint8Array(((len << 1) + 8) | 0);
        let tmpResult;
        let i = 0, pos = 0, point = 0, nextcode = 0;
        let upgradededArraySize = !Uint8Array; // normal arrays are auto-expanding
        for (i = 0; i < len; i = (i + 1) | 0, pos = (pos + 1) | 0) {
            point = encodedString.charCodeAt(i) | 0;
            if (point <= 0x007f) {
                result[pos] = point;
            }
            else if (point <= 0x07ff) {
                result[pos] = (0x6 << 5) | (point >> 6);
                result[(pos = (pos + 1) | 0)] = (0x2 << 6) | (point & 0x3f);
            }
            else {
                widenCheck: {
                    if (0xd800 <= point) {
                        if (point <= 0xdbff) {
                            nextcode = encodedString.charCodeAt((i = (i + 1) | 0)) | 0; // defaults to 0 when NaN, causing null replacement character
                            if (0xdc00 <= nextcode && nextcode <= 0xdfff) {
                                //point = ((point - 0xD800)<<10) + nextcode - 0xDC00 + 0x10000|0;
                                point = ((point << 10) + nextcode - 0x35fdc00) | 0;
                                if (point > 0xffff) {
                                    result[pos] = (0x1e /*0b11110*/ << 3) | (point >> 18);
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 12) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                                    result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
                                    continue;
                                }
                                break widenCheck;
                            }
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                        else if (point <= 0xdfff) {
                            point = 65533 /*0b1111111111111101*/; //return '\xEF\xBF\xBD';//fromCharCode(0xef, 0xbf, 0xbd);
                        }
                    }
                    if (!upgradededArraySize && i << 1 < pos && i << 1 < ((pos - 7) | 0)) {
                        upgradededArraySize = true;
                        tmpResult = new Uint8Array(len * 3);
                        tmpResult.set(result);
                        result = tmpResult;
                    }
                }
                result[pos] = (0xe /*0b1110*/ << 4) | (point >> 12);
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | ((point >> 6) & 0x3f) /*0b00111111*/;
                result[(pos = (pos + 1) | 0)] = (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/;
            }
        }
        return Uint8Array ? result.subarray(0, pos) : result.slice(0, pos);
    }
    encodeInto(inputString, u8Arr) {
        const encodedString = inputString === void 0 ? '' : ('' + inputString).replace(encoderRegexp, encoderReplacer);
        let len = encodedString.length | 0, i = 0, char = 0, read = 0;
        const u8ArrLen = u8Arr.length | 0;
        const inputLength = inputString.length | 0;
        if (u8ArrLen < len)
            len = u8ArrLen;
        putChars: {
            for (; i < len; i = (i + 1) | 0) {
                char = encodedString.charCodeAt(i) | 0;
                switch (char >> 4) {
                    case 0:
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                        read = (read + 1) | 0;
                    // extension points:
                    case 8:
                    case 9:
                    case 10:
                    case 11:
                        break;
                    case 12:
                    case 13:
                        if (((i + 1) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    case 14:
                        if (((i + 2) | 0) < u8ArrLen) {
                            //if (!(char === 0xEF && encodedString.substr(i+1|0,2) === "\xBF\xBD"))
                            read = (read + 1) | 0;
                            break;
                        }
                    case 15:
                        if (((i + 3) | 0) < u8ArrLen) {
                            read = (read + 1) | 0;
                            break;
                        }
                    default:
                        break putChars;
                }
                //read = read + ((char >> 6) !== 2) |0;
                u8Arr[i] = char;
            }
        }
        return { written: i, read: inputLength < read ? inputLength : read };
    }
}
exports.TextEncoder = TextEncoder;
/**
 * Encode a UTF-8 string into a Uint8Array
 */
function encode(s) {
    return TextEncoder.prototype.encode(s);
}
exports.encode = encode;
/**
 * Decode a Uint8Array into a UTF-8 string
 */
function decode(a) {
    return TextDecoder.prototype.decode(a);
}
exports.decode = decode;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js":
/*!*******************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js ***!
  \*******************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NamespaceNotFoundError = exports.WorkflowNotFoundError = exports.WorkflowExecutionAlreadyStartedError = exports.IllegalStateError = exports.PayloadConverterError = exports.ValueError = void 0;
const failure_1 = __webpack_require__(/*! ./failure */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/failure.js");
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Thrown from code that receives a value that is unexpected or that it's unable to handle.
 */
let ValueError = class ValueError extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.ValueError = ValueError;
exports.ValueError = ValueError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ValueError')
], ValueError);
/**
 * Thrown when a Payload Converter is misconfigured.
 */
let PayloadConverterError = class PayloadConverterError extends ValueError {
};
exports.PayloadConverterError = PayloadConverterError;
exports.PayloadConverterError = PayloadConverterError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('PayloadConverterError')
], PayloadConverterError);
/**
 * Used in different parts of the SDK to note that something unexpected has happened.
 */
let IllegalStateError = class IllegalStateError extends Error {
};
exports.IllegalStateError = IllegalStateError;
exports.IllegalStateError = IllegalStateError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('IllegalStateError')
], IllegalStateError);
/**
 * This exception is thrown in the following cases:
 *  - Workflow with the same Workflow Id is currently running
 *  - There is a closed Workflow with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE`
 *  - There is closed Workflow in the `Completed` state with the same Workflow Id and the {@link WorkflowOptions.workflowIdReusePolicy}
 *    is `WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY`
 */
let WorkflowExecutionAlreadyStartedError = class WorkflowExecutionAlreadyStartedError extends failure_1.TemporalFailure {
    constructor(message, workflowId, workflowType) {
        super(message);
        this.workflowId = workflowId;
        this.workflowType = workflowType;
    }
};
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError;
exports.WorkflowExecutionAlreadyStartedError = WorkflowExecutionAlreadyStartedError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowExecutionAlreadyStartedError')
], WorkflowExecutionAlreadyStartedError);
/**
 * Thrown when a Workflow with the given Id is not known to Temporal Server.
 * It could be because:
 * - Id passed is incorrect
 * - Workflow is closed (for some calls, e.g. `terminate`)
 * - Workflow was deleted from the Server after reaching its retention limit
 */
let WorkflowNotFoundError = class WorkflowNotFoundError extends Error {
    constructor(message, workflowId, runId) {
        super(message);
        this.workflowId = workflowId;
        this.runId = runId;
    }
};
exports.WorkflowNotFoundError = WorkflowNotFoundError;
exports.WorkflowNotFoundError = WorkflowNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowNotFoundError')
], WorkflowNotFoundError);
/**
 * Thrown when the specified namespace is not known to Temporal Server.
 */
let NamespaceNotFoundError = class NamespaceNotFoundError extends Error {
    constructor(namespace) {
        super(`Namespace not found: '${namespace}'`);
        this.namespace = namespace;
    }
};
exports.NamespaceNotFoundError = NamespaceNotFoundError;
exports.NamespaceNotFoundError = NamespaceNotFoundError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('NamespaceNotFoundError')
], NamespaceNotFoundError);


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/failure.js":
/*!********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/failure.js ***!
  \********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.rootCause = exports.ensureTemporalFailure = exports.ensureApplicationFailure = exports.ChildWorkflowFailure = exports.ActivityFailure = exports.TimeoutFailure = exports.TerminatedFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ServerFailure = exports.TemporalFailure = exports.RetryState = exports.TimeoutType = exports.FAILURE_SOURCE = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
exports.FAILURE_SOURCE = 'TypeScriptSDK';
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.TimeoutType
var TimeoutType;
(function (TimeoutType) {
    TimeoutType[TimeoutType["TIMEOUT_TYPE_UNSPECIFIED"] = 0] = "TIMEOUT_TYPE_UNSPECIFIED";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_START_TO_CLOSE"] = 1] = "TIMEOUT_TYPE_START_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_START"] = 2] = "TIMEOUT_TYPE_SCHEDULE_TO_START";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_SCHEDULE_TO_CLOSE"] = 3] = "TIMEOUT_TYPE_SCHEDULE_TO_CLOSE";
    TimeoutType[TimeoutType["TIMEOUT_TYPE_HEARTBEAT"] = 4] = "TIMEOUT_TYPE_HEARTBEAT";
})(TimeoutType || (exports.TimeoutType = TimeoutType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.RetryState
var RetryState;
(function (RetryState) {
    RetryState[RetryState["RETRY_STATE_UNSPECIFIED"] = 0] = "RETRY_STATE_UNSPECIFIED";
    RetryState[RetryState["RETRY_STATE_IN_PROGRESS"] = 1] = "RETRY_STATE_IN_PROGRESS";
    RetryState[RetryState["RETRY_STATE_NON_RETRYABLE_FAILURE"] = 2] = "RETRY_STATE_NON_RETRYABLE_FAILURE";
    RetryState[RetryState["RETRY_STATE_TIMEOUT"] = 3] = "RETRY_STATE_TIMEOUT";
    RetryState[RetryState["RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED"] = 4] = "RETRY_STATE_MAXIMUM_ATTEMPTS_REACHED";
    RetryState[RetryState["RETRY_STATE_RETRY_POLICY_NOT_SET"] = 5] = "RETRY_STATE_RETRY_POLICY_NOT_SET";
    RetryState[RetryState["RETRY_STATE_INTERNAL_SERVER_ERROR"] = 6] = "RETRY_STATE_INTERNAL_SERVER_ERROR";
    RetryState[RetryState["RETRY_STATE_CANCEL_REQUESTED"] = 7] = "RETRY_STATE_CANCEL_REQUESTED";
})(RetryState || (exports.RetryState = RetryState = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Represents failures that can cross Workflow and Activity boundaries.
 *
 * **Never extend this class or any of its children.**
 *
 * The only child class you should ever throw from your code is {@link ApplicationFailure}.
 */
let TemporalFailure = class TemporalFailure extends Error {
    constructor(message, cause) {
        super(message ?? undefined);
        this.cause = cause;
    }
};
exports.TemporalFailure = TemporalFailure;
exports.TemporalFailure = TemporalFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TemporalFailure')
], TemporalFailure);
/** Exceptions originated at the Temporal service. */
let ServerFailure = class ServerFailure extends TemporalFailure {
    constructor(message, nonRetryable, cause) {
        super(message, cause);
        this.nonRetryable = nonRetryable;
    }
};
exports.ServerFailure = ServerFailure;
exports.ServerFailure = ServerFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ServerFailure')
], ServerFailure);
/**
 * `ApplicationFailure`s are used to communicate application-specific failures in Workflows and Activities.
 *
 * The {@link type} property is matched against {@link RetryPolicy.nonRetryableErrorTypes} to determine if an instance
 * of this error is retryable. Another way to avoid retrying is by setting the {@link nonRetryable} flag to `true`.
 *
 * In Workflows, if you throw a non-`ApplicationFailure`, the Workflow Task will fail and be retried. If you throw an
 * `ApplicationFailure`, the Workflow Execution will fail.
 *
 * In Activities, you can either throw an `ApplicationFailure` or another `Error` to fail the Activity Task. In the
 * latter case, the `Error` will be converted to an `ApplicationFailure`. The conversion is done as following:
 *
 * - `type` is set to `error.constructor?.name ?? error.name`
 * - `message` is set to `error.message`
 * - `nonRetryable` is set to false
 * - `details` are set to null
 * - stack trace is copied from the original error
 *
 * When an {@link https://docs.temporal.io/concepts/what-is-an-activity-execution | Activity Execution} fails, the
 * `ApplicationFailure` from the last Activity Task will be the `cause` of the {@link ActivityFailure} thrown in the
 * Workflow.
 */
let ApplicationFailure = class ApplicationFailure extends TemporalFailure {
    /**
     * Alternatively, use {@link fromError} or {@link create}.
     */
    constructor(message, type, nonRetryable, details, cause) {
        super(message, cause);
        this.type = type;
        this.nonRetryable = nonRetryable;
        this.details = details;
    }
    /**
     * Create a new `ApplicationFailure` from an Error object.
     *
     * First calls {@link ensureApplicationFailure | `ensureApplicationFailure(error)`} and then overrides any fields
     * provided in `overrides`.
     */
    static fromError(error, overrides) {
        const failure = ensureApplicationFailure(error);
        Object.assign(failure, overrides);
        return failure;
    }
    /**
     * Create a new `ApplicationFailure`.
     *
     * By default, will be retryable (unless its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}).
     */
    static create(options) {
        const { message, type, nonRetryable = false, details, cause } = options;
        return new this(message, type, nonRetryable, details, cause);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to false. Note that this error will still
     * not be retried if its `type` is included in {@link RetryPolicy.nonRetryableErrorTypes}.
     *
     * @param message Optional error message
     * @param type Optional error type (used by {@link RetryPolicy.nonRetryableErrorTypes})
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static retryable(message, type, ...details) {
        return new this(message, type ?? 'Error', false, details);
    }
    /**
     * Get a new `ApplicationFailure` with the {@link nonRetryable} flag set to true.
     *
     * When thrown from an Activity or Workflow, the Activity or Workflow will not be retried (even if `type` is not
     * listed in {@link RetryPolicy.nonRetryableErrorTypes}).
     *
     * @param message Optional error message
     * @param type Optional error type
     * @param details Optional details about the failure. Serialized by the Worker's {@link PayloadConverter}.
     */
    static nonRetryable(message, type, ...details) {
        return new this(message, type ?? 'Error', true, details);
    }
};
exports.ApplicationFailure = ApplicationFailure;
exports.ApplicationFailure = ApplicationFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ApplicationFailure')
], ApplicationFailure);
/**
 * This error is thrown when Cancellation has been requested. To allow Cancellation to happen, let it propagate. To
 * ignore Cancellation, catch it and continue executing. Note that Cancellation can only be requested a single time, so
 * your Workflow/Activity Execution will not receive further Cancellation requests.
 *
 * When a Workflow or Activity has been successfully cancelled, a `CancelledFailure` will be the `cause`.
 */
let CancelledFailure = class CancelledFailure extends TemporalFailure {
    constructor(message, details = [], cause) {
        super(message, cause);
        this.details = details;
    }
};
exports.CancelledFailure = CancelledFailure;
exports.CancelledFailure = CancelledFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('CancelledFailure')
], CancelledFailure);
/**
 * Used as the `cause` when a Workflow has been terminated
 */
let TerminatedFailure = class TerminatedFailure extends TemporalFailure {
    constructor(message, cause) {
        super(message, cause);
    }
};
exports.TerminatedFailure = TerminatedFailure;
exports.TerminatedFailure = TerminatedFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TerminatedFailure')
], TerminatedFailure);
/**
 * Used to represent timeouts of Activities and Workflows
 */
let TimeoutFailure = class TimeoutFailure extends TemporalFailure {
    constructor(message, lastHeartbeatDetails, timeoutType) {
        super(message);
        this.lastHeartbeatDetails = lastHeartbeatDetails;
        this.timeoutType = timeoutType;
    }
};
exports.TimeoutFailure = TimeoutFailure;
exports.TimeoutFailure = TimeoutFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('TimeoutFailure')
], TimeoutFailure);
/**
 * Contains information about an Activity failure. Always contains the original reason for the failure as its `cause`.
 * For example, if an Activity timed out, the cause will be a {@link TimeoutFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ActivityFailure = class ActivityFailure extends TemporalFailure {
    constructor(message, activityType, activityId, retryState, identity, cause) {
        super(message, cause);
        this.activityType = activityType;
        this.activityId = activityId;
        this.retryState = retryState;
        this.identity = identity;
    }
};
exports.ActivityFailure = ActivityFailure;
exports.ActivityFailure = ActivityFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ActivityFailure')
], ActivityFailure);
/**
 * Contains information about a Child Workflow failure. Always contains the reason for the failure as its {@link cause}.
 * For example, if the Child was Terminated, the `cause` is a {@link TerminatedFailure}.
 *
 * This exception is expected to be thrown only by the framework code.
 */
let ChildWorkflowFailure = class ChildWorkflowFailure extends TemporalFailure {
    constructor(namespace, execution, workflowType, retryState, cause) {
        super('Child Workflow execution failed', cause);
        this.namespace = namespace;
        this.execution = execution;
        this.workflowType = workflowType;
        this.retryState = retryState;
    }
};
exports.ChildWorkflowFailure = ChildWorkflowFailure;
exports.ChildWorkflowFailure = ChildWorkflowFailure = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ChildWorkflowFailure')
], ChildWorkflowFailure);
/**
 * If `error` is already an `ApplicationFailure`, returns `error`.
 *
 * Otherwise, converts `error` into an `ApplicationFailure` with:
 *
 * - `message`: `error.message` or `String(error)`
 * - `type`: `error.constructor.name` or `error.name`
 * - `stack`: `error.stack` or `''`
 */
function ensureApplicationFailure(error) {
    if (error instanceof ApplicationFailure) {
        return error;
    }
    const message = ((0, type_helpers_1.isRecord)(error) && String(error.message)) || String(error);
    const type = ((0, type_helpers_1.isRecord)(error) && (error.constructor?.name ?? error.name)) || undefined;
    const failure = ApplicationFailure.create({ message, type, nonRetryable: false });
    failure.stack = ((0, type_helpers_1.isRecord)(error) && String(error.stack)) || '';
    return failure;
}
exports.ensureApplicationFailure = ensureApplicationFailure;
/**
 * If `err` is an Error it is turned into an `ApplicationFailure`.
 *
 * If `err` was already a `TemporalFailure`, returns the original error.
 *
 * Otherwise returns an `ApplicationFailure` with `String(err)` as the message.
 */
function ensureTemporalFailure(err) {
    if (err instanceof TemporalFailure) {
        return err;
    }
    return ensureApplicationFailure(err);
}
exports.ensureTemporalFailure = ensureTemporalFailure;
/**
 * Get the root cause message of given `error`.
 *
 * In case `error` is a {@link TemporalFailure}, recurse the `cause` chain and return the root `cause.message`.
 * Otherwise, return `error.message`.
 */
function rootCause(error) {
    if (error instanceof TemporalFailure) {
        return error.cause ? rootCause(error.cause) : error.message;
    }
    return (0, type_helpers_1.errorMessage)(error);
}
exports.rootCause = rootCause;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js":
/*!******************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js ***!
  \******************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * Common library for code that's used across the Client, Worker, and/or Workflow
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.errorCode = exports.errorMessage = exports.str = exports.u8 = void 0;
const encoding = __importStar(__webpack_require__(/*! ./encoding */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/encoding.js"));
const helpers = __importStar(__webpack_require__(/*! ./type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js"));
__exportStar(__webpack_require__(/*! ./activity-options */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/activity-options.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/data-converter */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/data-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/failure-converter */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/failure-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-codec */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-codec.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/payload-converter */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/payload-converter.js"), exports);
__exportStar(__webpack_require__(/*! ./converter/types */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/converter/types.js"), exports);
__exportStar(__webpack_require__(/*! ./deprecated-time */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/deprecated-time.js"), exports);
__exportStar(__webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./failure */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/failure.js"), exports);
__exportStar(__webpack_require__(/*! ./interfaces */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interfaces.js"), exports);
__exportStar(__webpack_require__(/*! ./logger */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/logger.js"), exports);
__exportStar(__webpack_require__(/*! ./retry-policy */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/retry-policy.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-handle */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! ./workflow-options */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-options.js"), exports);
__exportStar(__webpack_require__(/*! ./versioning-intent */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/versioning-intent.js"), exports);
/**
 * Encode a UTF-8 string into a Uint8Array
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function u8(s) {
    return encoding.encode(s);
}
exports.u8 = u8;
/**
 * Decode a Uint8Array into a UTF-8 string
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function str(arr) {
    return encoding.decode(arr);
}
exports.str = str;
/**
 * Get `error.message` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorMessage(error) {
    return helpers.errorMessage(error);
}
exports.errorMessage = errorMessage;
/**
 * Get `error.code` (or `undefined` if not present)
 *
 * @hidden
 * @deprecated - meant for internal use only
 */
function errorCode(error) {
    return helpers.errorCode(error);
}
exports.errorCode = errorCode;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interceptors.js":
/*!*************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interceptors.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.composeInterceptors = void 0;
/**
 * Compose all interceptor methods into a single function.
 *
 * Calling the composed function results in calling each of the provided interceptor, in order (from the first to
 * the last), followed by the original function provided as argument to `composeInterceptors()`.
 *
 * @param interceptors a list of interceptors
 * @param method the name of the interceptor method to compose
 * @param next the original function to be executed at the end of the interception chain
 */
// ts-prune-ignore-next (imported via lib/interceptors)
function composeInterceptors(interceptors, method, next) {
    for (let i = interceptors.length - 1; i >= 0; --i) {
        const interceptor = interceptors[i];
        if (interceptor[method] !== undefined) {
            const prev = next;
            // We lose type safety here because Typescript can't deduce that interceptor[method] is a function that returns
            // the same type as Next<I, M>
            next = ((input) => interceptor[method](input, prev));
        }
    }
    return next;
}
exports.composeInterceptors = composeInterceptors;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interfaces.js":
/*!***********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interfaces.js ***!
  \***********************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/logger.js":
/*!*******************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/logger.js ***!
  \*******************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/retry-policy.js":
/*!*************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/retry-policy.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.decompileRetryPolicy = exports.compileRetryPolicy = void 0;
const errors_1 = __webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js");
const time_1 = __webpack_require__(/*! ./time */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/time.js");
/**
 * Turn a TS RetryPolicy into a proto compatible RetryPolicy
 */
function compileRetryPolicy(retryPolicy) {
    if (retryPolicy.backoffCoefficient != null && retryPolicy.backoffCoefficient <= 0) {
        throw new errors_1.ValueError('RetryPolicy.backoffCoefficient must be greater than 0');
    }
    if (retryPolicy.maximumAttempts != null) {
        if (retryPolicy.maximumAttempts === Number.POSITIVE_INFINITY) {
            // drop field (Infinity is the default)
            const { maximumAttempts: _, ...without } = retryPolicy;
            retryPolicy = without;
        }
        else if (retryPolicy.maximumAttempts <= 0) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be a positive integer');
        }
        else if (!Number.isInteger(retryPolicy.maximumAttempts)) {
            throw new errors_1.ValueError('RetryPolicy.maximumAttempts must be an integer');
        }
    }
    const maximumInterval = (0, time_1.msOptionalToNumber)(retryPolicy.maximumInterval);
    const initialInterval = (0, time_1.msToNumber)(retryPolicy.initialInterval ?? 1000);
    if (maximumInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be 0');
    }
    if (initialInterval === 0) {
        throw new errors_1.ValueError('RetryPolicy.initialInterval cannot be 0');
    }
    if (maximumInterval != null && maximumInterval < initialInterval) {
        throw new errors_1.ValueError('RetryPolicy.maximumInterval cannot be less than its initialInterval');
    }
    return {
        maximumAttempts: retryPolicy.maximumAttempts,
        initialInterval: (0, time_1.msToTs)(initialInterval),
        maximumInterval: (0, time_1.msOptionalToTs)(maximumInterval),
        backoffCoefficient: retryPolicy.backoffCoefficient,
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes,
    };
}
exports.compileRetryPolicy = compileRetryPolicy;
/**
 * Turn a proto compatible RetryPolicy into a TS RetryPolicy
 */
function decompileRetryPolicy(retryPolicy) {
    if (!retryPolicy) {
        return undefined;
    }
    return {
        backoffCoefficient: retryPolicy.backoffCoefficient ?? undefined,
        maximumAttempts: retryPolicy.maximumAttempts ?? undefined,
        maximumInterval: (0, time_1.optionalTsToMs)(retryPolicy.maximumInterval),
        initialInterval: (0, time_1.optionalTsToMs)(retryPolicy.initialInterval),
        nonRetryableErrorTypes: retryPolicy.nonRetryableErrorTypes ?? undefined,
    };
}
exports.decompileRetryPolicy = decompileRetryPolicy;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/time.js":
/*!*****************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/time.js ***!
  \*****************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.optionalDateToTs = exports.optionalTsToDate = exports.tsToDate = exports.msToNumber = exports.msOptionalToNumber = exports.msOptionalToTs = exports.msToTs = exports.msNumberToTs = exports.tsToMs = exports.optionalTsToMs = void 0;
const long_1 = __importDefault(__webpack_require__(/*! long */ "../../node_modules/.pnpm/long@5.2.3/node_modules/long/umd/index.js")); // eslint-disable-line import/no-named-as-default
const ms_1 = __importDefault(__webpack_require__(/*! ms */ "../../node_modules/.pnpm/ms@3.0.0-canary.1/node_modules/ms/dist/index.cjs"));
const errors_1 = __webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js");
/**
 * Lossy conversion function from Timestamp to number due to possible overflow.
 * If ts is null or undefined returns undefined.
 */
function optionalTsToMs(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return tsToMs(ts);
}
exports.optionalTsToMs = optionalTsToMs;
/**
 * Lossy conversion function from Timestamp to number due to possible overflow
 */
function tsToMs(ts) {
    if (ts === undefined || ts === null) {
        throw new Error(`Expected timestamp, got ${ts}`);
    }
    const { seconds, nanos } = ts;
    return (seconds || long_1.default.UZERO)
        .mul(1000)
        .add(Math.floor((nanos || 0) / 1000000))
        .toNumber();
}
exports.tsToMs = tsToMs;
function msNumberToTs(millis) {
    const seconds = Math.floor(millis / 1000);
    const nanos = (millis % 1000) * 1000000;
    if (Number.isNaN(seconds) || Number.isNaN(nanos)) {
        throw new errors_1.ValueError(`Invalid millis ${millis}`);
    }
    return { seconds: long_1.default.fromNumber(seconds), nanos };
}
exports.msNumberToTs = msNumberToTs;
function msToTs(str) {
    return msNumberToTs(msToNumber(str));
}
exports.msToTs = msToTs;
function msOptionalToTs(str) {
    return str ? msToTs(str) : undefined;
}
exports.msOptionalToTs = msOptionalToTs;
function msOptionalToNumber(val) {
    if (val === undefined)
        return undefined;
    return msToNumber(val);
}
exports.msOptionalToNumber = msOptionalToNumber;
function msToNumber(val) {
    if (typeof val === 'number') {
        return val;
    }
    return msWithValidation(val);
}
exports.msToNumber = msToNumber;
function msWithValidation(str) {
    const millis = (0, ms_1.default)(str);
    if (millis == null || isNaN(millis)) {
        throw new TypeError(`Invalid duration string: '${str}'`);
    }
    return millis;
}
function tsToDate(ts) {
    return new Date(tsToMs(ts));
}
exports.tsToDate = tsToDate;
function optionalTsToDate(ts) {
    if (ts === undefined || ts === null) {
        return undefined;
    }
    return new Date(tsToMs(ts));
}
exports.optionalTsToDate = optionalTsToDate;
// ts-prune-ignore-next (imported via schedule-helpers.ts)
function optionalDateToTs(date) {
    if (date === undefined || date === null) {
        return undefined;
    }
    return msToTs(date.getTime());
}
exports.optionalDateToTs = optionalDateToTs;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js":
/*!*************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deepFreeze = exports.SymbolBasedInstanceOfError = exports.assertNever = exports.errorCode = exports.errorMessage = exports.isAbortError = exports.isError = exports.hasOwnProperties = exports.hasOwnProperty = exports.isRecord = exports.checkExtends = void 0;
/** Verify that an type _Copy extends _Orig */
function checkExtends() {
    // noop, just type check
}
exports.checkExtends = checkExtends;
function isRecord(value) {
    return typeof value === 'object' && value !== null;
}
exports.isRecord = isRecord;
function hasOwnProperty(record, prop) {
    return prop in record;
}
exports.hasOwnProperty = hasOwnProperty;
function hasOwnProperties(record, props) {
    return props.every((prop) => prop in record);
}
exports.hasOwnProperties = hasOwnProperties;
function isError(error) {
    return (isRecord(error) &&
        typeof error.name === 'string' &&
        typeof error.message === 'string' &&
        (error.stack == null || typeof error.stack === 'string'));
}
exports.isError = isError;
function isAbortError(error) {
    return isError(error) && error.name === 'AbortError';
}
exports.isAbortError = isAbortError;
/**
 * Get `error.message` (or `undefined` if not present)
 */
function errorMessage(error) {
    if (isError(error)) {
        return error.message;
    }
    else if (typeof error === 'string') {
        return error;
    }
    return undefined;
}
exports.errorMessage = errorMessage;
function isErrorWithCode(error) {
    return isRecord(error) && typeof error.code === 'string';
}
/**
 * Get `error.code` (or `undefined` if not present)
 */
function errorCode(error) {
    if (isErrorWithCode(error)) {
        return error.code;
    }
    return undefined;
}
exports.errorCode = errorCode;
/**
 * Asserts that some type is the never type
 */
function assertNever(msg, x) {
    throw new TypeError(msg + ': ' + x);
}
exports.assertNever = assertNever;
/**
 * A decorator to be used on error classes. It adds the 'name' property AND provides a custom
 * 'instanceof' handler that works correctly across execution contexts.
 *
 * ### Details ###
 *
 * According to the EcmaScript's spec, the default behavior of JavaScript's `x instanceof Y` operator is to walk up the
 * prototype chain of object 'x', checking if any constructor in that hierarchy is _exactly the same object_ as the
 * constructor function 'Y'.
 *
 * Unfortunately, it happens in various situations that different constructor function objects get created for what
 * appears to be the very same class. This leads to surprising behavior where `instanceof` returns false though it is
 * known that the object is indeed an instance of that class. One particular case where this happens is when constructor
 * 'Y' belongs to a different realm than the constuctor with which 'x' was instantiated. Another case is when two copies
 * of the same library gets loaded in the same realm.
 *
 * In practice, this tends to cause issues when crossing the workflow-sandboxing boundary (since Node's vm module
 * really creates new execution realms), as well as when running tests using Jest (see https://github.com/jestjs/jest/issues/2549
 * for some details on that one).
 *
 * This function injects a custom 'instanceof' handler into the prototype of 'clazz', which is both cross-realm safe and
 * cross-copies-of-the-same-lib safe. It works by adding a special symbol property to the prototype of 'clazz', and then
 * checking for the presence of that symbol.
 */
function SymbolBasedInstanceOfError(markerName) {
    return (clazz) => {
        const marker = Symbol.for(`__temporal_is${markerName}`);
        Object.defineProperty(clazz.prototype, 'name', { value: markerName, enumerable: true });
        Object.defineProperty(clazz.prototype, marker, { value: true, enumerable: false });
        Object.defineProperty(clazz, Symbol.hasInstance, {
            // eslint-disable-next-line object-shorthand
            value: function (error) {
                if (this === clazz) {
                    return isRecord(error) && error[marker] === true;
                }
                else {
                    // 'this' must be a _subclass_ of clazz that doesn't redefined [Symbol.hasInstance], so that it inherited
                    // from clazz's [Symbol.hasInstance]. If we don't handle this particular situation, then
                    // `x instanceof SubclassOfParent` would return true for any instance of 'Parent', which is clearly wrong.
                    //
                    // Ideally, it'd be preferable to avoid this case entirely, by making sure that all subclasses of 'clazz'
                    // redefine [Symbol.hasInstance], but we can't enforce that. We therefore fallback to the default instanceof
                    // behavior (which is NOT cross-realm safe).
                    return this.prototype.isPrototypeOf(error); // eslint-disable-line no-prototype-builtins
                }
            },
        });
    };
}
exports.SymbolBasedInstanceOfError = SymbolBasedInstanceOfError;
// Thanks MDN: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
function deepFreeze(object) {
    // Retrieve the property names defined on object
    const propNames = Object.getOwnPropertyNames(object);
    // Freeze properties before freezing self
    for (const name of propNames) {
        const value = object[name];
        if (value && typeof value === 'object') {
            try {
                deepFreeze(value);
            }
            catch (err) {
                // This is okay, there are some typed arrays that cannot be frozen (encodingKeys)
            }
        }
        else if (typeof value === 'function') {
            Object.freeze(value);
        }
    }
    return Object.freeze(object);
}
exports.deepFreeze = deepFreeze;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/versioning-intent-enum.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/versioning-intent-enum.js ***!
  \***********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.versioningIntentToProto = exports.VersioningIntent = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from coresdk.common.VersioningIntent
/**
 * Protobuf enum representation of {@link VersioningIntentString}.
 *
 * @experimental
 */
var VersioningIntent;
(function (VersioningIntent) {
    VersioningIntent[VersioningIntent["UNSPECIFIED"] = 0] = "UNSPECIFIED";
    VersioningIntent[VersioningIntent["COMPATIBLE"] = 1] = "COMPATIBLE";
    VersioningIntent[VersioningIntent["DEFAULT"] = 2] = "DEFAULT";
})(VersioningIntent || (exports.VersioningIntent = VersioningIntent = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function versioningIntentToProto(intent) {
    switch (intent) {
        case 'DEFAULT':
            return VersioningIntent.DEFAULT;
        case 'COMPATIBLE':
            return VersioningIntent.COMPATIBLE;
        case undefined:
            return VersioningIntent.UNSPECIFIED;
        default:
            (0, type_helpers_1.assertNever)('Unexpected VersioningIntent', intent);
    }
}
exports.versioningIntentToProto = versioningIntentToProto;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/versioning-intent.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/versioning-intent.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-handle.js":
/*!****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-handle.js ***!
  \****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-options.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-options.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.extractWorkflowType = exports.WorkflowIdReusePolicy = void 0;
const type_helpers_1 = __webpack_require__(/*! ./type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
// Avoid importing the proto implementation to reduce workflow bundle size
// Copied from temporal.api.enums.v1.WorkflowIdReusePolicy
/**
 * Concept: {@link https://docs.temporal.io/concepts/what-is-a-workflow-id-reuse-policy/ | Workflow Id Reuse Policy}
 *
 * Whether a Workflow can be started with a Workflow Id of a Closed Workflow.
 *
 * *Note: A Workflow can never be started with a Workflow Id of a Running Workflow.*
 */
var WorkflowIdReusePolicy;
(function (WorkflowIdReusePolicy) {
    /**
     * No need to use this.
     *
     * (If a `WorkflowIdReusePolicy` is set to this, or is not set at all, the default value will be used.)
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED"] = 0] = "WORKFLOW_ID_REUSE_POLICY_UNSPECIFIED";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state.
     * @default
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE"] = 1] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE";
    /**
     * The Workflow can be started if the previous Workflow is in a Closed state that is not Completed.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY"] = 2] = "WORKFLOW_ID_REUSE_POLICY_ALLOW_DUPLICATE_FAILED_ONLY";
    /**
     * The Workflow cannot be started.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE"] = 3] = "WORKFLOW_ID_REUSE_POLICY_REJECT_DUPLICATE";
    /**
     * Terminate the current workflow if one is already running.
     */
    WorkflowIdReusePolicy[WorkflowIdReusePolicy["WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING"] = 4] = "WORKFLOW_ID_REUSE_POLICY_TERMINATE_IF_RUNNING";
})(WorkflowIdReusePolicy || (exports.WorkflowIdReusePolicy = WorkflowIdReusePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
function extractWorkflowType(workflowTypeOrFunc) {
    if (typeof workflowTypeOrFunc === 'string')
        return workflowTypeOrFunc;
    if (typeof workflowTypeOrFunc === 'function') {
        if (workflowTypeOrFunc?.name)
            return workflowTypeOrFunc.name;
        throw new TypeError('Invalid workflow type: the workflow function is anonymous');
    }
    throw new TypeError(`Invalid workflow type: expected either a string or a function, got '${typeof workflowTypeOrFunc}'`);
}
exports.extractWorkflowType = extractWorkflowType;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/alea.js":
/*!*********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/alea.js ***!
  \*********************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

// A port of an algorithm by Johannes Baagøe <baagoe@baagoe.com>, 2010
// http://baagoe.com/en/RandomMusings/javascript/
// https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
// Original work is under MIT license -
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Mash = exports.alea = void 0;
// Copyright (C) 2010 by Johannes Baagøe <baagoe@baagoe.org>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// Taken and modified from https://github.com/davidbau/seedrandom/blob/released/lib/alea.js
class Alea {
    constructor(seed) {
        const mash = new Mash();
        // Apply the seeding algorithm from Baagoe.
        this.c = 1;
        this.s0 = mash.mash([32]);
        this.s1 = mash.mash([32]);
        this.s2 = mash.mash([32]);
        this.s0 -= mash.mash(seed);
        if (this.s0 < 0) {
            this.s0 += 1;
        }
        this.s1 -= mash.mash(seed);
        if (this.s1 < 0) {
            this.s1 += 1;
        }
        this.s2 -= mash.mash(seed);
        if (this.s2 < 0) {
            this.s2 += 1;
        }
    }
    next() {
        const t = 2091639 * this.s0 + this.c * 2.3283064365386963e-10; // 2^-32
        this.s0 = this.s1;
        this.s1 = this.s2;
        return (this.s2 = t - (this.c = t | 0));
    }
}
function alea(seed) {
    const xg = new Alea(seed);
    return xg.next.bind(xg);
}
exports.alea = alea;
class Mash {
    constructor() {
        this.n = 0xefc8249d;
    }
    mash(data) {
        let { n } = this;
        for (let i = 0; i < data.length; i++) {
            n += data[i];
            let h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000; // 2^32
        }
        this.n = n;
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
    }
}
exports.Mash = Mash;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js":
/*!***********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js ***!
  \***********************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CancellationScope_cancelRequested;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.registerSleepImplementation = exports.RootCancellationScope = exports.disableStorage = exports.CancellationScope = exports.AsyncLocalStorage = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js");
// AsyncLocalStorage is injected via vm module into global scope.
// In case Workflow code is imported in Node.js context, replace with an empty class.
exports.AsyncLocalStorage = globalThis.AsyncLocalStorage ?? class {
};
/** Magic symbol used to create the root scope - intentionally not exported */
const NO_PARENT = Symbol('NO_PARENT');
/**
 * In the SDK, Workflows are represented internally by a tree of scopes where the `execute` function runs in the root scope.
 * Cancellation propagates from outer scopes to inner ones and is handled by catching {@link CancelledFailure}s
 * thrown by cancellable operations (see below).
 *
 * Scopes are created using the `CancellationScope` constructor or the static helper methods
 * {@link cancellable}, {@link nonCancellable} and {@link withTimeout}.
 *
 * When a `CancellationScope` is cancelled, it will propagate cancellation any child scopes and any cancellable
 * operations created within it, such as:
 *
 * - Activities
 * - Child Workflows
 * - Timers (created with the {@link sleep} function)
 * - {@link Trigger}s
 *
 * @example
 *
 * ```ts
 * await CancellationScope.cancellable(async () => {
 *   const promise = someActivity();
 *   CancellationScope.current().cancel(); // Cancels the activity
 *   await promise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * });
 * ```
 *
 * @example
 *
 * ```ts
 * const scope = new CancellationScope();
 * const promise = scope.run(someActivity);
 * scope.cancel(); // Cancels the activity
 * await promise; // Throws `ActivityFailure` with `cause` set to `CancelledFailure`
 * ```
 */
class CancellationScope {
    constructor(options) {
        _CancellationScope_cancelRequested.set(this, false);
        this.timeout = options?.timeout;
        this.cancellable = options?.cancellable ?? true;
        this.cancelRequested = new Promise((_, reject) => {
            // Typescript does not understand that the Promise executor runs synchronously
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = (err) => {
                __classPrivateFieldSet(this, _CancellationScope_cancelRequested, true, "f");
                reject(err);
            };
        });
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested);
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.cancelRequested.catch(() => undefined));
        if (options?.parent !== NO_PARENT) {
            this.parent = options?.parent || CancellationScope.current();
            __classPrivateFieldSet(this, _CancellationScope_cancelRequested, __classPrivateFieldGet(this.parent, _CancellationScope_cancelRequested, "f"), "f");
            this.parent.cancelRequested.catch((err) => {
                this.reject(err);
            });
        }
    }
    get consideredCancelled() {
        return __classPrivateFieldGet(this, _CancellationScope_cancelRequested, "f") && this.cancellable;
    }
    /**
     * Activate the scope as current and run  `fn`
     *
     * Any timers, Activities, Triggers and CancellationScopes created in the body of `fn`
     * automatically link their cancellation to this scope.
     *
     * @return the result of `fn`
     */
    run(fn) {
        return storage.run(this, this.runInContext.bind(this, fn));
    }
    /**
     * Method that runs a function in AsyncLocalStorage context.
     *
     * Could have been written as anonymous function, made into a method for improved stack traces.
     */
    async runInContext(fn) {
        if (this.timeout) {
            (0, stack_helpers_1.untrackPromise)(sleep(this.timeout).then(() => this.cancel(), () => {
                // scope was already cancelled, ignore
            }));
        }
        return await fn();
    }
    /**
     * Request to cancel the scope and linked children
     */
    cancel() {
        this.reject(new common_1.CancelledFailure('Cancellation scope cancelled'));
    }
    /**
     * Get the current "active" scope
     */
    static current() {
        // Using globals directly instead of a helper function to avoid circular import
        return storage.getStore() ?? globalThis.__TEMPORAL_ACTIVATOR__.rootScope;
    }
    /** Alias to `new CancellationScope({ cancellable: true }).run(fn)` */
    static cancellable(fn) {
        return new this({ cancellable: true }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: false }).run(fn)` */
    static nonCancellable(fn) {
        return new this({ cancellable: false }).run(fn);
    }
    /** Alias to `new CancellationScope({ cancellable: true, timeout }).run(fn)` */
    static withTimeout(timeout, fn) {
        return new this({ cancellable: true, timeout }).run(fn);
    }
}
exports.CancellationScope = CancellationScope;
_CancellationScope_cancelRequested = new WeakMap();
const storage = new exports.AsyncLocalStorage();
/**
 * Avoid exposing the storage directly so it doesn't get frozen
 */
function disableStorage() {
    storage.disable();
}
exports.disableStorage = disableStorage;
class RootCancellationScope extends CancellationScope {
    constructor() {
        super({ cancellable: true, parent: NO_PARENT });
    }
    cancel() {
        this.reject(new common_1.CancelledFailure('Workflow cancelled'));
    }
}
exports.RootCancellationScope = RootCancellationScope;
/** This function is here to avoid a circular dependency between this module and workflow.ts */
let sleep = (_) => {
    throw new common_1.IllegalStateError('Workflow has not been properly initialized');
};
function registerSleepImplementation(fn) {
    sleep = fn;
}
exports.registerSleepImplementation = registerSleepImplementation;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js":
/*!***********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js ***!
  \***********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isCancellation = exports.LocalActivityDoBackoff = exports.DeterminismViolationError = exports.WorkflowError = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Base class for all workflow errors
 */
let WorkflowError = class WorkflowError extends Error {
};
exports.WorkflowError = WorkflowError;
exports.WorkflowError = WorkflowError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('WorkflowError')
], WorkflowError);
/**
 * Thrown in workflow when it tries to do something that non-deterministic such as construct a WeakRef()
 */
let DeterminismViolationError = class DeterminismViolationError extends WorkflowError {
};
exports.DeterminismViolationError = DeterminismViolationError;
exports.DeterminismViolationError = DeterminismViolationError = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('DeterminismViolationError')
], DeterminismViolationError);
/**
 * A class that acts as a marker for this special result type
 */
let LocalActivityDoBackoff = class LocalActivityDoBackoff extends Error {
    constructor(backoff) {
        super();
        this.backoff = backoff;
    }
};
exports.LocalActivityDoBackoff = LocalActivityDoBackoff;
exports.LocalActivityDoBackoff = LocalActivityDoBackoff = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('LocalActivityDoBackoff')
], LocalActivityDoBackoff);
/**
 * Returns whether provided `err` is caused by cancellation
 */
function isCancellation(err) {
    return (err instanceof common_1.CancelledFailure ||
        ((err instanceof common_1.ActivityFailure || err instanceof common_1.ChildWorkflowFailure) && err.cause instanceof common_1.CancelledFailure));
}
exports.isCancellation = isCancellation;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js":
/*!**********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js ***!
  \**********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getActivator = exports.assertInWorkflowContext = exports.maybeGetActivator = exports.setActivatorUntyped = exports.maybeGetActivatorUntyped = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
function maybeGetActivatorUntyped() {
    return globalThis.__TEMPORAL_ACTIVATOR__;
}
exports.maybeGetActivatorUntyped = maybeGetActivatorUntyped;
function setActivatorUntyped(activator) {
    globalThis.__TEMPORAL_ACTIVATOR__ = activator;
}
exports.setActivatorUntyped = setActivatorUntyped;
function maybeGetActivator() {
    return maybeGetActivatorUntyped();
}
exports.maybeGetActivator = maybeGetActivator;
function assertInWorkflowContext(message) {
    const activator = maybeGetActivator();
    if (activator == null)
        throw new common_1.IllegalStateError(message);
    return activator;
}
exports.assertInWorkflowContext = assertInWorkflowContext;
function getActivator() {
    const activator = maybeGetActivator();
    if (activator === undefined) {
        throw new common_1.IllegalStateError('Workflow uninitialized');
    }
    return activator;
}
exports.getActivator = getActivator;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/index.js":
/*!**********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/index.js ***!
  \**********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * This library provides tools required for authoring workflows.
 *
 * ## Usage
 * See the {@link https://docs.temporal.io/typescript/hello-world#workflows | tutorial} for writing your first workflow.
 *
 * ### Timers
 *
 * The recommended way of scheduling timers is by using the {@link sleep} function. We've replaced `setTimeout` and
 * `clearTimeout` with deterministic versions so these are also usable but have a limitation that they don't play well
 * with {@link https://docs.temporal.io/typescript/cancellation-scopes | cancellation scopes}.
 *
 * <!--SNIPSTART typescript-sleep-workflow-->
 * <!--SNIPEND-->
 *
 * ### Activities
 *
 * To schedule Activities, use {@link proxyActivities} to obtain an Activity function and call.
 *
 * <!--SNIPSTART typescript-schedule-activity-workflow-->
 * <!--SNIPEND-->
 *
 * ### Updates, Signals and Queries
 *
 * Use {@link setHandler} to set handlers for Updates, Signals, and Queries.
 *
 * Update and Signal handlers can be either async or non-async functions. Update handlers may return a value, but signal
 * handlers may not (return `void` or `Promise<void>`). You may use Activities, Timers, child Workflows, etc in Update
 * and Signal handlers, but this should be done cautiously: for example, note that if you await async operations such as
 * these in an Update or Signal handler, then you are responsible for ensuring that the workflow does not complete first.
 *
 * Query handlers may **not** be async functions, and may **not** mutate any variables or use Activities, Timers,
 * child Workflows, etc.
 *
 * #### Implementation
 *
 * <!--SNIPSTART typescript-workflow-update-signal-query-example-->
 * <!--SNIPEND-->
 *
 * ### More
 *
 * - [Deterministic built-ins](https://docs.temporal.io/typescript/determinism#sources-of-non-determinism)
 * - [Cancellation and scopes](https://docs.temporal.io/typescript/cancellation-scopes)
 *   - {@link CancellationScope}
 *   - {@link Trigger}
 * - [Sinks](https://docs.temporal.io/application-development/observability/?lang=ts#logging)
 *   - {@link Sinks}
 *
 * @module
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = exports.log = exports.proxySinks = exports.ParentClosePolicy = exports.ContinueAsNew = exports.ChildWorkflowCancellationType = exports.CancellationScope = exports.AsyncLocalStorage = exports.TimeoutFailure = exports.TerminatedFailure = exports.TemporalFailure = exports.ServerFailure = exports.rootCause = exports.defaultPayloadConverter = exports.ChildWorkflowFailure = exports.CancelledFailure = exports.ApplicationFailure = exports.ActivityFailure = exports.ActivityCancellationType = void 0;
var common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
Object.defineProperty(exports, "ActivityCancellationType", ({ enumerable: true, get: function () { return common_1.ActivityCancellationType; } }));
Object.defineProperty(exports, "ActivityFailure", ({ enumerable: true, get: function () { return common_1.ActivityFailure; } }));
Object.defineProperty(exports, "ApplicationFailure", ({ enumerable: true, get: function () { return common_1.ApplicationFailure; } }));
Object.defineProperty(exports, "CancelledFailure", ({ enumerable: true, get: function () { return common_1.CancelledFailure; } }));
Object.defineProperty(exports, "ChildWorkflowFailure", ({ enumerable: true, get: function () { return common_1.ChildWorkflowFailure; } }));
Object.defineProperty(exports, "defaultPayloadConverter", ({ enumerable: true, get: function () { return common_1.defaultPayloadConverter; } }));
Object.defineProperty(exports, "rootCause", ({ enumerable: true, get: function () { return common_1.rootCause; } }));
Object.defineProperty(exports, "ServerFailure", ({ enumerable: true, get: function () { return common_1.ServerFailure; } }));
Object.defineProperty(exports, "TemporalFailure", ({ enumerable: true, get: function () { return common_1.TemporalFailure; } }));
Object.defineProperty(exports, "TerminatedFailure", ({ enumerable: true, get: function () { return common_1.TerminatedFailure; } }));
Object.defineProperty(exports, "TimeoutFailure", ({ enumerable: true, get: function () { return common_1.TimeoutFailure; } }));
__exportStar(__webpack_require__(/*! @temporalio/common/lib/errors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-handle */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-handle.js"), exports);
__exportStar(__webpack_require__(/*! @temporalio/common/lib/workflow-options */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/workflow-options.js"), exports);
var cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js");
Object.defineProperty(exports, "AsyncLocalStorage", ({ enumerable: true, get: function () { return cancellation_scope_1.AsyncLocalStorage; } }));
Object.defineProperty(exports, "CancellationScope", ({ enumerable: true, get: function () { return cancellation_scope_1.CancellationScope; } }));
__exportStar(__webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js"), exports);
__exportStar(__webpack_require__(/*! ./interceptors */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interceptors.js"), exports);
var interfaces_1 = __webpack_require__(/*! ./interfaces */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interfaces.js");
Object.defineProperty(exports, "ChildWorkflowCancellationType", ({ enumerable: true, get: function () { return interfaces_1.ChildWorkflowCancellationType; } }));
Object.defineProperty(exports, "ContinueAsNew", ({ enumerable: true, get: function () { return interfaces_1.ContinueAsNew; } }));
Object.defineProperty(exports, "ParentClosePolicy", ({ enumerable: true, get: function () { return interfaces_1.ParentClosePolicy; } }));
var sinks_1 = __webpack_require__(/*! ./sinks */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/sinks.js");
Object.defineProperty(exports, "proxySinks", ({ enumerable: true, get: function () { return sinks_1.proxySinks; } }));
var logs_1 = __webpack_require__(/*! ./logs */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/logs.js");
Object.defineProperty(exports, "log", ({ enumerable: true, get: function () { return logs_1.log; } }));
var trigger_1 = __webpack_require__(/*! ./trigger */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/trigger.js");
Object.defineProperty(exports, "Trigger", ({ enumerable: true, get: function () { return trigger_1.Trigger; } }));
__exportStar(__webpack_require__(/*! ./workflow */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/workflow.js"), exports);


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interceptors.js":
/*!*****************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interceptors.js ***!
  \*****************************************************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * Type definitions and generic helpers for interceptors.
 *
 * The Workflow specific interceptors are defined here.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interfaces.js":
/*!***************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interfaces.js ***!
  \***************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ParentClosePolicy = exports.ChildWorkflowCancellationType = exports.ContinueAsNew = void 0;
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
/**
 * Not an actual error, used by the Workflow runtime to abort execution when {@link continueAsNew} is called
 */
let ContinueAsNew = class ContinueAsNew extends Error {
    constructor(command) {
        super('Workflow continued as new');
        this.command = command;
    }
};
exports.ContinueAsNew = ContinueAsNew;
exports.ContinueAsNew = ContinueAsNew = __decorate([
    (0, type_helpers_1.SymbolBasedInstanceOfError)('ContinueAsNew')
], ContinueAsNew);
/**
 * Specifies:
 * - whether cancellation requests are sent to the Child
 * - whether and when a {@link CanceledFailure} is thrown from {@link executeChild} or
 *   {@link ChildWorkflowHandle.result}
 *
 * @default {@link ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED}
 */
var ChildWorkflowCancellationType;
(function (ChildWorkflowCancellationType) {
    /**
     * Don't send a cancellation request to the Child.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["ABANDON"] = 0] = "ABANDON";
    /**
     * Send a cancellation request to the Child. Immediately throw the error.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["TRY_CANCEL"] = 1] = "TRY_CANCEL";
    /**
     * Send a cancellation request to the Child. The Child may respect cancellation, in which case an error will be thrown
     * when cancellation has completed, and {@link isCancellation}(error) will be true. On the other hand, the Child may
     * ignore the cancellation request, in which case an error might be thrown with a different cause, or the Child may
     * complete successfully.
     *
     * @default
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_COMPLETED"] = 2] = "WAIT_CANCELLATION_COMPLETED";
    /**
     * Send a cancellation request to the Child. Throw the error once the Server receives the Child cancellation request.
     */
    ChildWorkflowCancellationType[ChildWorkflowCancellationType["WAIT_CANCELLATION_REQUESTED"] = 3] = "WAIT_CANCELLATION_REQUESTED";
})(ChildWorkflowCancellationType || (exports.ChildWorkflowCancellationType = ChildWorkflowCancellationType = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * How a Child Workflow reacts to the Parent Workflow reaching a Closed state.
 *
 * @see {@link https://docs.temporal.io/concepts/what-is-a-parent-close-policy/ | Parent Close Policy}
 */
var ParentClosePolicy;
(function (ParentClosePolicy) {
    /**
     * If a `ParentClosePolicy` is set to this, or is not set at all, the server default value will be used.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_UNSPECIFIED"] = 0] = "PARENT_CLOSE_POLICY_UNSPECIFIED";
    /**
     * When the Parent is Closed, the Child is Terminated.
     *
     * @default
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_TERMINATE"] = 1] = "PARENT_CLOSE_POLICY_TERMINATE";
    /**
     * When the Parent is Closed, nothing is done to the Child.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_ABANDON"] = 2] = "PARENT_CLOSE_POLICY_ABANDON";
    /**
     * When the Parent is Closed, the Child is Cancelled.
     */
    ParentClosePolicy[ParentClosePolicy["PARENT_CLOSE_POLICY_REQUEST_CANCEL"] = 3] = "PARENT_CLOSE_POLICY_REQUEST_CANCEL";
})(ParentClosePolicy || (exports.ParentClosePolicy = ParentClosePolicy = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/internals.js":
/*!**************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/internals.js ***!
  \**************************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Activator = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interceptors.js");
const type_helpers_1 = __webpack_require__(/*! @temporalio/common/lib/type-helpers */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/type-helpers.js");
const alea_1 = __webpack_require__(/*! ./alea */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/alea.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interfaces.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js");
const pkg_1 = __importDefault(__webpack_require__(/*! ./pkg */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/pkg.js"));
const logs_1 = __webpack_require__(/*! ./logs */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/logs.js");
var StartChildWorkflowExecutionFailedCause;
(function (StartChildWorkflowExecutionFailedCause) {
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED"] = 0] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_UNSPECIFIED";
    StartChildWorkflowExecutionFailedCause[StartChildWorkflowExecutionFailedCause["START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS"] = 1] = "START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS";
})(StartChildWorkflowExecutionFailedCause || (StartChildWorkflowExecutionFailedCause = {}));
(0, type_helpers_1.checkExtends)();
(0, type_helpers_1.checkExtends)();
/**
 * Keeps all of the Workflow runtime state like pending completions for activities and timers.
 *
 * Implements handlers for all workflow activation jobs.
 */
class Activator {
    constructor({ info, now, showStackTraceSources, sourceMap, getTimeOfDay, randomnessSeed, patches, registeredActivityNames, }) {
        /**
         * Cache for modules - referenced in reusable-vm.ts
         */
        this.moduleCache = new Map();
        /**
         * Map of task sequence to a Completion
         */
        this.completions = {
            timer: new Map(),
            activity: new Map(),
            childWorkflowStart: new Map(),
            childWorkflowComplete: new Map(),
            signalWorkflow: new Map(),
            cancelWorkflow: new Map(),
        };
        /**
         * Holds buffered Update calls until a handler is registered
         */
        this.bufferedUpdates = Array();
        /**
         * Holds buffered signal calls until a handler is registered
         */
        this.bufferedSignals = Array();
        /**
         * Holds buffered query calls until a handler is registered.
         *
         * **IMPORTANT** queries are only buffered until workflow is started.
         * This is required because async interceptors might block workflow function invocation
         * which delays query handler registration.
         */
        this.bufferedQueries = Array();
        /**
         * Mapping of update name to handler and validator
         */
        this.updateHandlers = new Map();
        /**
         * Mapping of signal name to handler
         */
        this.signalHandlers = new Map();
        this.promiseStackStore = {
            promiseToStack: new Map(),
            childToParent: new Map(),
        };
        this.rootScope = new cancellation_scope_1.RootCancellationScope();
        /**
         * Mapping of query name to handler
         */
        this.queryHandlers = new Map([
            [
                '__stack_trace',
                {
                    handler: () => {
                        return this.getStackTraces()
                            .map((s) => s.formatted)
                            .join('\n\n');
                    },
                    description: 'Returns a sensible stack trace.',
                },
            ],
            [
                '__enhanced_stack_trace',
                {
                    handler: () => {
                        const { sourceMap } = this;
                        const sdk = { name: 'typescript', version: pkg_1.default.version };
                        const stacks = this.getStackTraces().map(({ structured: locations }) => ({ locations }));
                        const sources = {};
                        if (this.showStackTraceSources) {
                            for (const { locations } of stacks) {
                                for (const { filePath } of locations) {
                                    if (!filePath)
                                        continue;
                                    const content = sourceMap?.sourcesContent?.[sourceMap?.sources.indexOf(filePath)];
                                    if (!content)
                                        continue;
                                    sources[filePath] = [
                                        {
                                            content,
                                            lineOffset: 0,
                                        },
                                    ];
                                }
                            }
                        }
                        return { sdk, stacks, sources };
                    },
                    description: 'Returns a stack trace annotated with source information.',
                },
            ],
            [
                '__temporal_workflow_metadata',
                {
                    handler: () => {
                        const workflowType = this.info.workflowType;
                        const queryDefinitions = Array.from(this.queryHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const signalDefinitions = Array.from(this.signalHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        const updateDefinitions = Array.from(this.updateHandlers.entries()).map(([name, value]) => ({
                            name,
                            description: value.description,
                        }));
                        return {
                            definition: {
                                type: workflowType,
                                description: null, // For now, do not set the workflow description in the TS SDK.
                                queryDefinitions,
                                signalDefinitions,
                                updateDefinitions,
                            },
                        };
                    },
                    description: 'Returns metadata associated with this workflow.',
                },
            ],
        ]);
        /**
         * Loaded in {@link initRuntime}
         */
        this.interceptors = { inbound: [], outbound: [], internals: [] };
        /**
         * Buffer that stores all generated commands, reset after each activation
         */
        this.commands = [];
        /**
         * Stores all {@link condition}s that haven't been unblocked yet
         */
        this.blockedConditions = new Map();
        /**
         * Is this Workflow completed?
         *
         * A Workflow will be considered completed if it generates a command that the
         * system considers as a final Workflow command (e.g.
         * completeWorkflowExecution or failWorkflowExecution).
         */
        this.completed = false;
        /**
         * Was this Workflow cancelled?
         */
        this.cancelled = false;
        /**
         * This is tracked to allow buffering queries until a workflow function is called.
         * TODO(bergundy): I don't think this makes sense since queries run last in an activation and must be responded to in
         * the same activation.
         */
        this.workflowFunctionWasCalled = false;
        /**
         * The next (incremental) sequence to assign when generating completable commands
         */
        this.nextSeqs = {
            timer: 1,
            activity: 1,
            childWorkflow: 1,
            signalWorkflow: 1,
            cancelWorkflow: 1,
            condition: 1,
            // Used internally to keep track of active stack traces
            stack: 1,
        };
        this.payloadConverter = common_1.defaultPayloadConverter;
        this.failureConverter = common_1.defaultFailureConverter;
        /**
         * Patches we know the status of for this workflow, as in {@link patched}
         */
        this.knownPresentPatches = new Set();
        /**
         * Patches we sent to core {@link patched}
         */
        this.sentPatches = new Set();
        /**
         * Buffered sink calls per activation
         */
        this.sinkCalls = Array();
        this.getTimeOfDay = getTimeOfDay;
        this.info = info;
        this.now = now;
        this.showStackTraceSources = showStackTraceSources;
        this.sourceMap = sourceMap;
        this.random = (0, alea_1.alea)(randomnessSeed);
        this.registeredActivityNames = registeredActivityNames;
        if (info.unsafe.isReplaying) {
            for (const patchId of patches) {
                this.notifyHasPatch({ patchId });
            }
        }
    }
    mutateWorkflowInfo(fn) {
        this.info = fn(this.info);
    }
    getStackTraces() {
        const { childToParent, promiseToStack } = this.promiseStackStore;
        const internalNodes = [...childToParent.values()].reduce((acc, curr) => {
            for (const p of curr) {
                acc.add(p);
            }
            return acc;
        }, new Set());
        const stacks = new Map();
        for (const child of childToParent.keys()) {
            if (!internalNodes.has(child)) {
                const stack = promiseToStack.get(child);
                if (!stack || !stack.formatted)
                    continue;
                stacks.set(stack.formatted, stack);
            }
        }
        // Not 100% sure where this comes from, just filter it out
        stacks.delete('    at Promise.then (<anonymous>)');
        stacks.delete('    at Promise.then (<anonymous>)\n');
        return [...stacks].map(([_, stack]) => stack);
    }
    getAndResetSinkCalls() {
        const { sinkCalls } = this;
        this.sinkCalls = [];
        return sinkCalls;
    }
    /**
     * Buffer a Workflow command to be collected at the end of the current activation.
     *
     * Prevents commands from being added after Workflow completion.
     */
    pushCommand(cmd, complete = false) {
        // Only query responses may be sent after completion
        if (this.completed && !cmd.respondToQuery)
            return;
        this.commands.push(cmd);
        if (complete) {
            this.completed = true;
        }
    }
    getAndResetCommands() {
        const commands = this.commands;
        this.commands = [];
        return commands;
    }
    async startWorkflowNextHandler({ args }) {
        const { workflow } = this;
        if (workflow === undefined) {
            throw new common_1.IllegalStateError('Workflow uninitialized');
        }
        let promise;
        try {
            promise = workflow(...args);
        }
        finally {
            // Queries must be handled even if there was an exception when invoking the Workflow function.
            this.workflowFunctionWasCalled = true;
            // Empty the buffer
            const buffer = this.bufferedQueries.splice(0);
            for (const activation of buffer) {
                this.queryWorkflow(activation);
            }
        }
        return await promise;
    }
    startWorkflow(activation) {
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'execute', this.startWorkflowNextHandler.bind(this));
        (0, stack_helpers_1.untrackPromise)((0, logs_1.executeWithLifecycleLogging)(() => execute({
            headers: activation.headers ?? {},
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
        })).then(this.completeWorkflow.bind(this), this.handleWorkflowFailure.bind(this)));
    }
    cancelWorkflow(_activation) {
        this.cancelled = true;
        this.rootScope.cancel();
    }
    fireTimer(activation) {
        // Timers are a special case where their completion might not be in Workflow state,
        // this is due to immediate timer cancellation that doesn't go wait for Core.
        const completion = this.maybeConsumeCompletion('timer', getSeq(activation));
        completion?.resolve(undefined);
    }
    resolveActivity(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveActivity activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('activity', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            const err = failure ? this.failureToError(failure) : undefined;
            reject(err);
        }
        else if (activation.result.backoff) {
            reject(new errors_1.LocalActivityDoBackoff(activation.result.backoff));
        }
    }
    resolveChildWorkflowExecutionStart(activation) {
        const { resolve, reject } = this.consumeCompletion('childWorkflowStart', getSeq(activation));
        if (activation.succeeded) {
            resolve(activation.succeeded.runId);
        }
        else if (activation.failed) {
            if (activation.failed.cause !==
                StartChildWorkflowExecutionFailedCause.START_CHILD_WORKFLOW_EXECUTION_FAILED_CAUSE_WORKFLOW_ALREADY_EXISTS) {
                throw new common_1.IllegalStateError('Got unknown StartChildWorkflowExecutionFailedCause');
            }
            if (!(activation.seq && activation.failed.workflowId && activation.failed.workflowType)) {
                throw new TypeError('Missing attributes in activation job');
            }
            reject(new common_1.WorkflowExecutionAlreadyStartedError('Workflow execution already started', activation.failed.workflowId, activation.failed.workflowType));
        }
        else if (activation.cancelled) {
            if (!activation.cancelled.failure) {
                throw new TypeError('Got no failure in cancelled variant');
            }
            reject(this.failureToError(activation.cancelled.failure));
        }
        else {
            throw new TypeError('Got ResolveChildWorkflowExecutionStart with no status');
        }
    }
    resolveChildWorkflowExecution(activation) {
        if (!activation.result) {
            throw new TypeError('Got ResolveChildWorkflowExecution activation with no result');
        }
        const { resolve, reject } = this.consumeCompletion('childWorkflowComplete', getSeq(activation));
        if (activation.result.completed) {
            const completed = activation.result.completed;
            const result = completed.result ? this.payloadConverter.fromPayload(completed.result) : undefined;
            resolve(result);
        }
        else if (activation.result.failed) {
            const { failure } = activation.result.failed;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got failed result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
        else if (activation.result.cancelled) {
            const { failure } = activation.result.cancelled;
            if (failure === undefined || failure === null) {
                throw new TypeError('Got cancelled result with no failure attribute');
            }
            reject(this.failureToError(failure));
        }
    }
    // Intentionally non-async function so this handler doesn't show up in the stack trace
    queryWorkflowNextHandler({ queryName, args }) {
        const fn = this.queryHandlers.get(queryName)?.handler;
        if (fn === undefined) {
            const knownQueryTypes = [...this.queryHandlers.keys()].join(' ');
            // Fail the query
            return Promise.reject(new ReferenceError(`Workflow did not register a handler for ${queryName}. Registered queries: [${knownQueryTypes}]`));
        }
        try {
            const ret = fn(...args);
            if (ret instanceof Promise) {
                return Promise.reject(new errors_1.DeterminismViolationError('Query handlers should not return a Promise'));
            }
            return Promise.resolve(ret);
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    queryWorkflow(activation) {
        if (!this.workflowFunctionWasCalled) {
            this.bufferedQueries.push(activation);
            return;
        }
        const { queryType, queryId, headers } = activation;
        if (!(queryType && queryId)) {
            throw new TypeError('Missing query activation attributes');
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleQuery', this.queryWorkflowNextHandler.bind(this));
        execute({
            queryName: queryType,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.arguments),
            queryId,
            headers: headers ?? {},
        }).then((result) => this.completeQuery(queryId, result), (reason) => this.failQuery(queryId, reason));
    }
    doUpdate(activation) {
        const { id: updateId, protocolInstanceId, name, headers, runValidator } = activation;
        if (!updateId) {
            throw new TypeError('Missing activation update id');
        }
        if (!name) {
            throw new TypeError('Missing activation update name');
        }
        if (!protocolInstanceId) {
            throw new TypeError('Missing activation update protocolInstanceId');
        }
        if (!this.updateHandlers.has(name)) {
            this.bufferedUpdates.push(activation);
            return;
        }
        const makeInput = () => ({
            updateId,
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            name,
            headers: headers ?? {},
        });
        // The implementation below is responsible for upholding, and constrained
        // by, the following contract:
        //
        // 1. If no validator is present then validation interceptors will not be run.
        //
        // 2. During validation, any error must fail the Update; during the Update
        //    itself, Temporal errors fail the Update whereas other errors fail the
        //    activation.
        //
        // 3. The handler must not see any mutations of the arguments made by the
        //    validator.
        //
        // 4. Any error when decoding/deserializing input must be caught and result
        //    in rejection of the Update before it is accepted, even if there is no
        //    validator.
        //
        // 5. The initial synchronous portion of the (async) Update handler should
        //    be executed after the (sync) validator completes such that there is
        //    minimal opportunity for a different concurrent task to be scheduled
        //    between them.
        //
        // 6. The stack trace view provided in the Temporal UI must not be polluted
        //    by promises that do not derive from user code. This implies that
        //    async/await syntax may not be used.
        //
        // Note that there is a deliberately unhandled promise rejection below.
        // These are caught elsewhere and fail the corresponding activation.
        let input;
        try {
            if (runValidator && this.updateHandlers.get(name)?.validator) {
                const validate = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'validateUpdate', this.validateUpdateNextHandler.bind(this));
                validate(makeInput());
            }
            input = makeInput();
        }
        catch (error) {
            this.rejectUpdate(protocolInstanceId, error);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleUpdate', this.updateNextHandler.bind(this));
        this.acceptUpdate(protocolInstanceId);
        (0, stack_helpers_1.untrackPromise)(execute(input)
            .then((result) => this.completeUpdate(protocolInstanceId, result))
            .catch((error) => {
            if (error instanceof common_1.TemporalFailure) {
                this.rejectUpdate(protocolInstanceId, error);
            }
            else {
                throw error;
            }
        }));
    }
    async updateNextHandler({ name, args }) {
        const entry = this.updateHandlers.get(name);
        if (!entry) {
            return Promise.reject(new common_1.IllegalStateError(`No registered update handler for update: ${name}`));
        }
        const { handler } = entry;
        return await handler(...args);
    }
    validateUpdateNextHandler({ name, args }) {
        const { validator } = this.updateHandlers.get(name) ?? {};
        if (validator) {
            validator(...args);
        }
    }
    dispatchBufferedUpdates() {
        const bufferedUpdates = this.bufferedUpdates;
        while (bufferedUpdates.length) {
            const foundIndex = bufferedUpdates.findIndex((update) => this.updateHandlers.has(update.name));
            if (foundIndex === -1) {
                // No buffered Updates have a handler yet.
                break;
            }
            const [update] = bufferedUpdates.splice(foundIndex, 1);
            this.doUpdate(update);
        }
    }
    rejectBufferedUpdates() {
        while (this.bufferedUpdates.length) {
            const update = this.bufferedUpdates.shift();
            if (update) {
                this.rejectUpdate(
                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                update.protocolInstanceId, common_1.ApplicationFailure.nonRetryable(`No registered handler for update: ${update.name}`));
            }
        }
    }
    async signalWorkflowNextHandler({ signalName, args }) {
        const fn = this.signalHandlers.get(signalName)?.handler;
        if (fn) {
            return await fn(...args);
        }
        else if (this.defaultSignalHandler) {
            return await this.defaultSignalHandler(signalName, ...args);
        }
        else {
            throw new common_1.IllegalStateError(`No registered signal handler for signal: ${signalName}`);
        }
    }
    signalWorkflow(activation) {
        const { signalName, headers } = activation;
        if (!signalName) {
            throw new TypeError('Missing activation signalName');
        }
        if (!this.signalHandlers.has(signalName) && !this.defaultSignalHandler) {
            this.bufferedSignals.push(activation);
            return;
        }
        const execute = (0, interceptors_1.composeInterceptors)(this.interceptors.inbound, 'handleSignal', this.signalWorkflowNextHandler.bind(this));
        execute({
            args: (0, common_1.arrayFromPayloads)(this.payloadConverter, activation.input),
            signalName,
            headers: headers ?? {},
        }).catch(this.handleWorkflowFailure.bind(this));
    }
    dispatchBufferedSignals() {
        const bufferedSignals = this.bufferedSignals;
        while (bufferedSignals.length) {
            if (this.defaultSignalHandler) {
                // We have a default signal handler, so all signals are dispatchable
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.signalWorkflow(bufferedSignals.shift());
            }
            else {
                const foundIndex = bufferedSignals.findIndex((signal) => this.signalHandlers.has(signal.signalName));
                if (foundIndex === -1)
                    break;
                const [signal] = bufferedSignals.splice(foundIndex, 1);
                this.signalWorkflow(signal);
            }
        }
    }
    resolveSignalExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('signalWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    resolveRequestCancelExternalWorkflow(activation) {
        const { resolve, reject } = this.consumeCompletion('cancelWorkflow', getSeq(activation));
        if (activation.failure) {
            reject(this.failureToError(activation.failure));
        }
        else {
            resolve(undefined);
        }
    }
    updateRandomSeed(activation) {
        if (!activation.randomnessSeed) {
            throw new TypeError('Expected activation with randomnessSeed attribute');
        }
        this.random = (0, alea_1.alea)(activation.randomnessSeed.toBytes());
    }
    notifyHasPatch(activation) {
        if (!activation.patchId) {
            throw new TypeError('Notify has patch missing patch name');
        }
        this.knownPresentPatches.add(activation.patchId);
    }
    removeFromCache() {
        throw new common_1.IllegalStateError('removeFromCache activation job should not reach workflow');
    }
    /**
     * Transforms failures into a command to be sent to the server.
     * Used to handle any failure emitted by the Workflow.
     */
    async handleWorkflowFailure(error) {
        if (this.cancelled && (0, errors_1.isCancellation)(error)) {
            this.pushCommand({ cancelWorkflowExecution: {} }, true);
        }
        else if (error instanceof interfaces_1.ContinueAsNew) {
            this.pushCommand({ continueAsNewWorkflowExecution: error.command }, true);
        }
        else {
            if (!(error instanceof common_1.TemporalFailure)) {
                // This results in an unhandled rejection which will fail the activation
                // preventing it from completing.
                throw error;
            }
            this.pushCommand({
                failWorkflowExecution: {
                    failure: this.errorToFailure(error),
                },
            }, true);
        }
    }
    completeQuery(queryId, result) {
        this.pushCommand({
            respondToQuery: { queryId, succeeded: { response: this.payloadConverter.toPayload(result) } },
        });
    }
    failQuery(queryId, error) {
        this.pushCommand({
            respondToQuery: {
                queryId,
                failed: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    acceptUpdate(protocolInstanceId) {
        this.pushCommand({ updateResponse: { protocolInstanceId, accepted: {} } });
    }
    completeUpdate(protocolInstanceId, result) {
        this.pushCommand({
            updateResponse: { protocolInstanceId, completed: this.payloadConverter.toPayload(result) },
        });
    }
    rejectUpdate(protocolInstanceId, error) {
        this.pushCommand({
            updateResponse: {
                protocolInstanceId,
                rejected: this.errorToFailure((0, common_1.ensureTemporalFailure)(error)),
            },
        });
    }
    /** Consume a completion if it exists in Workflow state */
    maybeConsumeCompletion(type, taskSeq) {
        const completion = this.completions[type].get(taskSeq);
        if (completion !== undefined) {
            this.completions[type].delete(taskSeq);
        }
        return completion;
    }
    /** Consume a completion if it exists in Workflow state, throws if it doesn't */
    consumeCompletion(type, taskSeq) {
        const completion = this.maybeConsumeCompletion(type, taskSeq);
        if (completion === undefined) {
            throw new common_1.IllegalStateError(`No completion for taskSeq ${taskSeq}`);
        }
        return completion;
    }
    completeWorkflow(result) {
        this.pushCommand({
            completeWorkflowExecution: {
                result: this.payloadConverter.toPayload(result),
            },
        }, true);
    }
    errorToFailure(err) {
        return this.failureConverter.errorToFailure(err, this.payloadConverter);
    }
    failureToError(failure) {
        return this.failureConverter.failureToError(failure, this.payloadConverter);
    }
}
exports.Activator = Activator;
function getSeq(activation) {
    const seq = activation.seq;
    if (seq === undefined || seq === null) {
        throw new TypeError(`Got activation with no seq attribute`);
    }
    return seq;
}


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/logs.js":
/*!*********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/logs.js ***!
  \*********************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowLogAttributes = exports.executeWithLifecycleLogging = exports.log = void 0;
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interceptors.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js");
const sinks_1 = __webpack_require__(/*! ./sinks */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/sinks.js");
const errors_1 = __webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interfaces.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js");
const loggerSink = (0, sinks_1.proxySinks)().__temporal_logger;
/**
 * Symbol used by the SDK logger to extract a timestamp from log attributes.
 * Also defined in `worker/logger.ts` - intentionally not shared.
 */
const LogTimestamp = Symbol.for('log_timestamp');
/**
 * Default workflow logger.
 *
 * This logger is replay-aware and will omit log messages on workflow replay. Messages emitted by this logger are
 * funnelled through a sink that forwards them to the logger registered on {@link Runtime.logger}.
 *
 * Notice that since sinks are used to power this logger, any log attributes must be transferable via the
 * {@link https://nodejs.org/api/worker_threads.html#worker_threads_port_postmessage_value_transferlist | postMessage}
 * API.
 *
 * NOTE: Specifying a custom logger through {@link defaultSink} or by manually registering a sink named
 * `defaultWorkerLogger` has been deprecated. Please use {@link Runtime.logger} instead.
 */
exports.log = Object.fromEntries(['trace', 'debug', 'info', 'warn', 'error'].map((level) => {
    return [
        level,
        (message, attrs) => {
            const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.log(...) may only be used from workflow context.');
            const getLogAttributes = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'getLogAttributes', (a) => a);
            return loggerSink[level](message, {
                // Inject the call time in nanosecond resolution as expected by the worker logger.
                [LogTimestamp]: activator.getTimeOfDay(),
                ...getLogAttributes(workflowLogAttributes(activator.info)),
                ...attrs,
            });
        },
    ];
}));
function executeWithLifecycleLogging(fn) {
    exports.log.debug('Workflow started');
    const p = fn().then((res) => {
        exports.log.debug('Workflow completed');
        return res;
    }, (error) => {
        // Avoid using instanceof checks in case the modules they're defined in loaded more than once,
        // e.g. by jest or when multiple versions are installed.
        if (typeof error === 'object' && error != null) {
            if ((0, errors_1.isCancellation)(error)) {
                exports.log.debug('Workflow completed as cancelled');
                throw error;
            }
            else if (error instanceof interfaces_1.ContinueAsNew) {
                exports.log.debug('Workflow continued as new');
                throw error;
            }
        }
        exports.log.warn('Workflow failed', { error });
        throw error;
    });
    // Avoid showing this interceptor in stack trace query
    (0, stack_helpers_1.untrackPromise)(p);
    return p;
}
exports.executeWithLifecycleLogging = executeWithLifecycleLogging;
/**
 * Returns a map of attributes to be set _by default_ on log messages for a given Workflow.
 * Note that this function may be called from outside of the Workflow context (eg. by the worker itself).
 */
function workflowLogAttributes(info) {
    return {
        namespace: info.namespace,
        taskQueue: info.taskQueue,
        workflowId: info.workflowId,
        runId: info.runId,
        workflowType: info.workflowType,
    };
}
exports.workflowLogAttributes = workflowLogAttributes;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/pkg.js":
/*!********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/pkg.js ***!
  \********************************************************************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
// ../package.json is outside of the TS project rootDir which causes TS to complain about this import.
// We do not want to change the rootDir because it messes up the output structure.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const package_json_1 = __importDefault(__webpack_require__(/*! ../package.json */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/package.json"));
exports["default"] = package_json_1.default;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/sinks.js":
/*!**********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/sinks.js ***!
  \**********************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

/**
 * Type definitions for the Workflow end of the sinks mechanism.
 *
 * Sinks are a mechanism for exporting data from the Workflow isolate to the
 * Node.js environment, they are necessary because the Workflow has no way to
 * communicate with the outside World.
 *
 * Sinks are typically used for exporting logs, metrics and traces out from the
 * Workflow.
 *
 * Sink functions may not return values to the Workflow in order to prevent
 * breaking determinism.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.proxySinks = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Get a reference to Sinks for exporting data out of the Workflow.
 *
 * These Sinks **must** be registered with the Worker in order for this
 * mechanism to work.
 *
 * @example
 * ```ts
 * import { proxySinks, Sinks } from '@temporalio/workflow';
 *
 * interface MySinks extends Sinks {
 *   logger: {
 *     info(message: string): void;
 *     error(message: string): void;
 *   };
 * }
 *
 * const { logger } = proxySinks<MyDependencies>();
 * logger.info('setting up');
 *
 * export function myWorkflow() {
 *   return {
 *     async execute() {
 *       logger.info("hey ho");
 *       logger.error("lets go");
 *     }
 *   };
 * }
 * ```
 */
function proxySinks() {
    return new Proxy({}, {
        get(_, ifaceName) {
            return new Proxy({}, {
                get(_, fnName) {
                    return (...args) => {
                        const activator = (0, global_attributes_1.assertInWorkflowContext)('Proxied sinks functions may only be used from a Workflow Execution.');
                        activator.sinkCalls.push({
                            ifaceName: ifaceName,
                            fnName: fnName,
                            // Sink function doesn't get called immediately. Make a clone of the sink's args, so that further mutations
                            // to these objects don't corrupt the args that the sink function will receive. Only available from node 17.
                            args: globalThis.structuredClone ? globalThis.structuredClone(args) : args,
                            // activator.info is internally copy-on-write. This ensure that any further mutations
                            // to the workflow state in the context of the present activation will not corrupt the
                            // workflowInfo state that gets passed when the sink function actually gets called.
                            workflowInfo: activator.info,
                        });
                    };
                },
            });
        },
    });
}
exports.proxySinks = proxySinks;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js":
/*!******************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js ***!
  \******************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.untrackPromise = void 0;
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js");
/**
 * Helper function to remove a promise from being tracked for stack trace query purposes
 */
function untrackPromise(promise) {
    const store = (0, global_attributes_1.maybeGetActivatorUntyped)()?.promiseStackStore;
    if (!store)
        return;
    store.childToParent.delete(promise);
    store.promiseToStack.delete(promise);
}
exports.untrackPromise = untrackPromise;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/trigger.js":
/*!************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/trigger.js ***!
  \************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Trigger = void 0;
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js");
/**
 * A `PromiseLike` helper which exposes its `resolve` and `reject` methods.
 *
 * Trigger is CancellationScope-aware: it is linked to the current scope on
 * construction and throws when that scope is cancelled.
 *
 * Useful for e.g. waiting for unblocking a Workflow from a Signal.
 *
 * @example
 * <!--SNIPSTART typescript-trigger-workflow-->
 * <!--SNIPEND-->
 */
class Trigger {
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            const scope = cancellation_scope_1.CancellationScope.current();
            if (scope.consideredCancelled || scope.cancellable) {
                (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.resolve = resolve;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            this.reject = reject;
        });
        // Avoid unhandled rejections
        (0, stack_helpers_1.untrackPromise)(this.promise.catch(() => undefined));
    }
    then(onfulfilled, onrejected) {
        return this.promise.then(onfulfilled, onrejected);
    }
}
exports.Trigger = Trigger;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/worker-interface.js":
/*!*********************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/worker-interface.js ***!
  \*********************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.dispose = exports.shouldUnblockConditions = exports.tryUnblockConditions = exports.getAndResetSinkCalls = exports.concludeActivation = exports.activate = exports.initRuntime = exports.overrideGlobals = void 0;
/**
 * Exported functions for the Worker to interact with the Workflow isolate
 *
 * @module
 */
const common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const errors_1 = __webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js");
const internals_1 = __webpack_require__(/*! ./internals */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/internals.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js");
const global = globalThis;
const OriginalDate = globalThis.Date;
function overrideGlobals() {
    // Mock any weak reference because GC is non-deterministic and the effect is observable from the Workflow.
    // Workflow developer will get a meaningful exception if they try to use these.
    global.WeakRef = function () {
        throw new errors_1.DeterminismViolationError('WeakRef cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.FinalizationRegistry = function () {
        throw new errors_1.DeterminismViolationError('FinalizationRegistry cannot be used in Workflows because v8 GC is non-deterministic');
    };
    global.Date = function (...args) {
        if (args.length > 0) {
            return new OriginalDate(...args);
        }
        return new OriginalDate((0, global_attributes_1.getActivator)().now);
    };
    global.Date.now = function () {
        return (0, global_attributes_1.getActivator)().now;
    };
    global.Date.parse = OriginalDate.parse.bind(OriginalDate);
    global.Date.UTC = OriginalDate.UTC.bind(OriginalDate);
    global.Date.prototype = OriginalDate.prototype;
    /**
     * @param ms sleep duration -  number of milliseconds. If given a negative number, value will be set to 1.
     */
    global.setTimeout = function (cb, ms, ...args) {
        const activator = (0, global_attributes_1.getActivator)();
        ms = Math.max(1, ms);
        const seq = activator.nextSeqs.timer++;
        // Create a Promise for AsyncLocalStorage to be able to track this completion using promise hooks.
        new Promise((resolve, reject) => {
            activator.completions.timer.set(seq, { resolve, reject });
            activator.pushCommand({
                startTimer: {
                    seq,
                    startToFireTimeout: (0, time_1.msToTs)(ms),
                },
            });
        }).then(() => cb(...args), () => undefined /* ignore cancellation */);
        return seq;
    };
    global.clearTimeout = function (handle) {
        const activator = (0, global_attributes_1.getActivator)();
        activator.nextSeqs.timer++;
        activator.completions.timer.delete(handle);
        activator.pushCommand({
            cancelTimer: {
                seq: handle,
            },
        });
    };
    // activator.random is mutable, don't hardcode its reference
    Math.random = () => (0, global_attributes_1.getActivator)().random();
}
exports.overrideGlobals = overrideGlobals;
/**
 * Initialize the isolate runtime.
 *
 * Sets required internal state and instantiates the workflow and interceptors.
 */
function initRuntime(options) {
    const activator = new internals_1.Activator({
        ...options,
        info: fixPrototypes({
            ...options.info,
            unsafe: { ...options.info.unsafe, now: OriginalDate.now },
        }),
    });
    // There's on activator per workflow instance, set it globally on the context.
    // We do this before importing any user code so user code can statically reference @temporalio/workflow functions
    // as well as Date and Math.random.
    (0, global_attributes_1.setActivatorUntyped)(activator);
    // webpack alias to payloadConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customPayloadConverter = (__webpack_require__(/*! __temporal_custom_payload_converter */ "?4bb4").payloadConverter);
    // The `payloadConverter` export is validated in the Worker
    if (customPayloadConverter != null) {
        activator.payloadConverter = customPayloadConverter;
    }
    // webpack alias to failureConverterPath
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const customFailureConverter = (__webpack_require__(/*! __temporal_custom_failure_converter */ "?7975").failureConverter);
    // The `failureConverter` export is validated in the Worker
    if (customFailureConverter != null) {
        activator.failureConverter = customFailureConverter;
    }
    const { importWorkflows, importInterceptors } = global.__TEMPORAL__;
    if (importWorkflows === undefined || importInterceptors === undefined) {
        throw new common_1.IllegalStateError('Workflow bundle did not register import hooks');
    }
    const interceptors = importInterceptors();
    for (const mod of interceptors) {
        const factory = mod.interceptors;
        if (factory !== undefined) {
            if (typeof factory !== 'function') {
                throw new TypeError(`Failed to initialize workflows interceptors: expected a function, but got: '${factory}'`);
            }
            const interceptors = factory();
            activator.interceptors.inbound.push(...(interceptors.inbound ?? []));
            activator.interceptors.outbound.push(...(interceptors.outbound ?? []));
            activator.interceptors.internals.push(...(interceptors.internals ?? []));
        }
    }
    const mod = importWorkflows();
    const workflowFn = mod[activator.info.workflowType];
    const defaultWorkflowFn = mod['default'];
    if (typeof workflowFn === 'function') {
        activator.workflow = workflowFn;
    }
    else if (typeof defaultWorkflowFn === 'function') {
        activator.workflow = defaultWorkflowFn;
    }
    else {
        const details = workflowFn === undefined
            ? 'no such function is exported by the workflow bundle'
            : `expected a function, but got: '${typeof workflowFn}'`;
        throw new TypeError(`Failed to initialize workflow of type '${activator.info.workflowType}': ${details}`);
    }
}
exports.initRuntime = initRuntime;
/**
 * Objects transfered to the VM from outside have prototypes belonging to the
 * outer context, which means that instanceof won't work inside the VM. This
 * function recursively walks over the content of an object, and recreate some
 * of these objects (notably Array, Date and Objects).
 */
function fixPrototypes(obj) {
    if (obj != null && typeof obj === 'object') {
        switch (Object.getPrototypeOf(obj)?.constructor?.name) {
            case 'Array':
                return Array.from(obj.map(fixPrototypes));
            case 'Date':
                return new Date(obj);
            default:
                return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fixPrototypes(v)]));
        }
    }
    else
        return obj;
}
/**
 * Run a chunk of activation jobs
 * @returns a boolean indicating whether job was processed or ignored
 */
function activate(activation, batchIndex) {
    const activator = (0, global_attributes_1.getActivator)();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'activate', ({ activation, batchIndex }) => {
        if (batchIndex === 0) {
            if (!activation.jobs) {
                throw new TypeError('Got activation with no jobs');
            }
            if (activation.timestamp != null) {
                // timestamp will not be updated for activation that contain only queries
                activator.now = (0, time_1.tsToMs)(activation.timestamp);
            }
            // The Rust Core ensures that these activation fields are not null
            activator.mutateWorkflowInfo((info) => ({
                ...info,
                historyLength: activation.historyLength,
                // Exact truncation for multi-petabyte histories
                // historySize === 0 means WFT was generated by pre-1.20.0 server, and the history size is unknown
                historySize: activation.historySizeBytes?.toNumber() || 0,
                continueAsNewSuggested: activation.continueAsNewSuggested ?? false,
                currentBuildId: activation.buildIdForCurrentTask ?? undefined,
                unsafe: {
                    ...info.unsafe,
                    isReplaying: activation.isReplaying ?? false,
                },
            }));
        }
        // Cast from the interface to the class which has the `variant` attribute.
        // This is safe because we know that activation is a proto class.
        const jobs = activation.jobs;
        for (const job of jobs) {
            if (job.variant === undefined) {
                throw new TypeError('Expected job.variant to be defined');
            }
            const variant = job[job.variant];
            if (!variant) {
                throw new TypeError(`Expected job.${job.variant} to be set`);
            }
            // The only job that can be executed on a completed workflow is a query.
            // We might get other jobs after completion for instance when a single
            // activation contains multiple jobs and the first one completes the workflow.
            if (activator.completed && job.variant !== 'queryWorkflow') {
                return;
            }
            activator[job.variant](variant /* TS can't infer this type */);
            if (shouldUnblockConditions(job)) {
                tryUnblockConditions();
            }
        }
    });
    intercept({
        activation,
        batchIndex,
    });
}
exports.activate = activate;
/**
 * Conclude a single activation.
 * Should be called after processing all activation jobs and queued microtasks.
 *
 * Activation failures are handled in the main Node.js isolate.
 */
function concludeActivation() {
    const activator = (0, global_attributes_1.getActivator)();
    activator.rejectBufferedUpdates();
    const intercept = (0, interceptors_1.composeInterceptors)(activator.interceptors.internals, 'concludeActivation', (input) => input);
    const { info } = activator;
    const { commands } = intercept({ commands: activator.getAndResetCommands() });
    return {
        runId: info.runId,
        successful: { commands },
    };
}
exports.concludeActivation = concludeActivation;
function getAndResetSinkCalls() {
    return (0, global_attributes_1.getActivator)().getAndResetSinkCalls();
}
exports.getAndResetSinkCalls = getAndResetSinkCalls;
/**
 * Loop through all blocked conditions, evaluate and unblock if possible.
 *
 * @returns number of unblocked conditions.
 */
function tryUnblockConditions() {
    let numUnblocked = 0;
    for (;;) {
        const prevUnblocked = numUnblocked;
        for (const [seq, cond] of (0, global_attributes_1.getActivator)().blockedConditions.entries()) {
            if (cond.fn()) {
                cond.resolve();
                numUnblocked++;
                // It is safe to delete elements during map iteration
                (0, global_attributes_1.getActivator)().blockedConditions.delete(seq);
            }
        }
        if (prevUnblocked === numUnblocked) {
            break;
        }
    }
    return numUnblocked;
}
exports.tryUnblockConditions = tryUnblockConditions;
/**
 * Predicate used to prevent triggering conditions for non-query and non-patch jobs.
 */
function shouldUnblockConditions(job) {
    return !job.queryWorkflow && !job.notifyHasPatch;
}
exports.shouldUnblockConditions = shouldUnblockConditions;
function dispose() {
    const dispose = (0, interceptors_1.composeInterceptors)((0, global_attributes_1.getActivator)().interceptors.internals, 'dispose', async () => {
        (0, cancellation_scope_1.disableStorage)();
    });
    dispose({});
}
exports.dispose = dispose;


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/workflow.js":
/*!*************************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/workflow.js ***!
  \*************************************************************************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.workflowMetadataQuery = exports.enhancedStackTraceQuery = exports.stackTraceQuery = exports.upsertSearchAttributes = exports.setDefaultSignalHandler = exports.setHandler = exports.defineQuery = exports.defineSignal = exports.defineUpdate = exports.condition = exports.deprecatePatch = exports.patched = exports.uuid4 = exports.continueAsNew = exports.makeContinueAsNewFunc = exports.inWorkflowContext = exports.workflowInfo = exports.executeChild = exports.startChild = exports.getExternalWorkflowHandle = exports.proxyLocalActivities = exports.proxyActivities = exports.NotAnActivityMethod = exports.scheduleLocalActivity = exports.scheduleActivity = exports.sleep = exports.addDefaultWorkflowOptions = void 0;
const common_1 = __webpack_require__(/*! @temporalio/common */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/index.js");
const versioning_intent_enum_1 = __webpack_require__(/*! @temporalio/common/lib/versioning-intent-enum */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/versioning-intent-enum.js");
const time_1 = __webpack_require__(/*! @temporalio/common/lib/time */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/time.js");
const interceptors_1 = __webpack_require__(/*! @temporalio/common/lib/interceptors */ "../../node_modules/.pnpm/@temporalio+common@1.9.3/node_modules/@temporalio/common/lib/interceptors.js");
const cancellation_scope_1 = __webpack_require__(/*! ./cancellation-scope */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/cancellation-scope.js");
const interfaces_1 = __webpack_require__(/*! ./interfaces */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/interfaces.js");
const errors_1 = __webpack_require__(/*! ./errors */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/errors.js");
const global_attributes_1 = __webpack_require__(/*! ./global-attributes */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/global-attributes.js");
const stack_helpers_1 = __webpack_require__(/*! ./stack-helpers */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/stack-helpers.js");
// Avoid a circular dependency
(0, cancellation_scope_1.registerSleepImplementation)(sleep);
/**
 * Adds default values to `workflowId` and `workflowIdReusePolicy` to given workflow options.
 */
function addDefaultWorkflowOptions(opts) {
    const { args, workflowId, ...rest } = opts;
    return {
        workflowId: workflowId ?? uuid4(),
        args: args ?? [],
        cancellationType: interfaces_1.ChildWorkflowCancellationType.WAIT_CANCELLATION_COMPLETED,
        ...rest,
    };
}
exports.addDefaultWorkflowOptions = addDefaultWorkflowOptions;
/**
 * Push a startTimer command into state accumulator and register completion
 */
function timerNextHandler(input) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                if (!activator.completions.timer.delete(input.seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    cancelTimer: {
                        seq: input.seq,
                    },
                });
                reject(err);
            }));
        }
        activator.pushCommand({
            startTimer: {
                seq: input.seq,
                startToFireTimeout: (0, time_1.msToTs)(input.durationMs),
            },
        });
        activator.completions.timer.set(input.seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Asynchronous sleep.
 *
 * Schedules a timer on the Temporal service.
 *
 * @param ms sleep duration - number of milliseconds or {@link https://www.npmjs.com/package/ms | ms-formatted string}.
 * If given a negative number or 0, value will be set to 1.
 */
function sleep(ms) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.sleep(...) may only be used from a Workflow Execution');
    const seq = activator.nextSeqs.timer++;
    const durationMs = Math.max(1, (0, time_1.msToNumber)(ms));
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startTimer', timerNextHandler);
    return execute({
        durationMs,
        seq,
    });
}
exports.sleep = sleep;
function validateActivityOptions(options) {
    if (options.scheduleToCloseTimeout === undefined && options.startToCloseTimeout === undefined) {
        throw new TypeError('Required either scheduleToCloseTimeout or startToCloseTimeout');
    }
}
// Use same validation we use for normal activities
const validateLocalActivityOptions = validateActivityOptions;
/**
 * Push a scheduleActivity command into activator accumulator and register completion
 */
function scheduleActivityNextHandler({ options, args, headers, seq, activityType }) {
    const activator = (0, global_attributes_1.getActivator)();
    validateActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleActivity: {
                seq,
                activityId: options.activityId ?? `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                heartbeatTimeout: (0, time_1.msOptionalToTs)(options.heartbeatTimeout),
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                headers,
                cancellationType: options.cancellationType,
                doNotEagerlyExecute: !(options.allowEagerDispatch ?? true),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Push a scheduleActivity command into state accumulator and register completion
 */
async function scheduleLocalActivityNextHandler({ options, args, headers, seq, activityType, attempt, originalScheduleTime, }) {
    const activator = (0, global_attributes_1.getActivator)();
    // Eagerly fail the local activity (which will in turn fail the workflow task.
    // Do not fail on replay where the local activities may not be registered on the replay worker.
    if (!activator.info.unsafe.isReplaying && !activator.registeredActivityNames.has(activityType)) {
        throw new ReferenceError(`Local activity of type '${activityType}' not registered on worker`);
    }
    validateLocalActivityOptions(options);
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.activity.has(seq)) {
                    return; // Already resolved or never scheduled
                }
                activator.pushCommand({
                    requestCancelLocalActivity: {
                        seq,
                    },
                });
            }));
        }
        activator.pushCommand({
            scheduleLocalActivity: {
                seq,
                attempt,
                originalScheduleTime,
                // Intentionally not exposing activityId as an option
                activityId: `${seq}`,
                activityType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                scheduleToCloseTimeout: (0, time_1.msOptionalToTs)(options.scheduleToCloseTimeout),
                startToCloseTimeout: (0, time_1.msOptionalToTs)(options.startToCloseTimeout),
                scheduleToStartTimeout: (0, time_1.msOptionalToTs)(options.scheduleToStartTimeout),
                localRetryThreshold: (0, time_1.msOptionalToTs)(options.localRetryThreshold),
                headers,
                cancellationType: options.cancellationType,
            },
        });
        activator.completions.activity.set(seq, {
            resolve,
            reject,
        });
    });
}
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
function scheduleActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    const seq = activator.nextSeqs.activity++;
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleActivity', scheduleActivityNextHandler);
    return execute({
        activityType,
        headers: {},
        options,
        args,
        seq,
    });
}
exports.scheduleActivity = scheduleActivity;
/**
 * Schedule an activity and run outbound interceptors
 * @hidden
 */
async function scheduleLocalActivity(activityType, args, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.scheduleLocalActivity(...) may only be used from a Workflow Execution');
    if (options === undefined) {
        throw new TypeError('Got empty activity options');
    }
    let attempt = 1;
    let originalScheduleTime = undefined;
    for (;;) {
        const seq = activator.nextSeqs.activity++;
        const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'scheduleLocalActivity', scheduleLocalActivityNextHandler);
        try {
            return (await execute({
                activityType,
                headers: {},
                options,
                args,
                seq,
                attempt,
                originalScheduleTime,
            }));
        }
        catch (err) {
            if (err instanceof errors_1.LocalActivityDoBackoff) {
                await sleep((0, time_1.tsToMs)(err.backoff.backoffDuration));
                if (typeof err.backoff.attempt !== 'number') {
                    throw new TypeError('Invalid backoff attempt type');
                }
                attempt = err.backoff.attempt;
                originalScheduleTime = err.backoff.originalScheduleTime ?? undefined;
            }
            else {
                throw err;
            }
        }
    }
}
exports.scheduleLocalActivity = scheduleLocalActivity;
function startChildWorkflowExecutionNextHandler({ options, headers, workflowType, seq, }) {
    const activator = (0, global_attributes_1.getActivator)();
    const workflowId = options.workflowId ?? uuid4();
    const startPromise = new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                const complete = !activator.completions.childWorkflowComplete.has(seq);
                if (!complete) {
                    activator.pushCommand({
                        cancelChildWorkflowExecution: { childWorkflowSeq: seq },
                    });
                }
                // Nothing to cancel otherwise
            }));
        }
        activator.pushCommand({
            startChildWorkflowExecution: {
                seq,
                workflowId,
                workflowType,
                input: (0, common_1.toPayloads)(activator.payloadConverter, ...options.args),
                retryPolicy: options.retry ? (0, common_1.compileRetryPolicy)(options.retry) : undefined,
                taskQueue: options.taskQueue || activator.info.taskQueue,
                workflowExecutionTimeout: (0, time_1.msOptionalToTs)(options.workflowExecutionTimeout),
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                namespace: activator.info.namespace, // Not configurable
                headers,
                cancellationType: options.cancellationType,
                workflowIdReusePolicy: options.workflowIdReusePolicy,
                parentClosePolicy: options.parentClosePolicy,
                cronSchedule: options.cronSchedule,
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            },
        });
        activator.completions.childWorkflowStart.set(seq, {
            resolve,
            reject,
        });
    });
    // We construct a Promise for the completion of the child Workflow before we know
    // if the Workflow code will await it to capture the result in case it does.
    const completePromise = new Promise((resolve, reject) => {
        // Chain start Promise rejection to the complete Promise.
        (0, stack_helpers_1.untrackPromise)(startPromise.catch(reject));
        activator.completions.childWorkflowComplete.set(seq, {
            resolve,
            reject,
        });
    });
    (0, stack_helpers_1.untrackPromise)(startPromise);
    (0, stack_helpers_1.untrackPromise)(completePromise);
    // Prevent unhandled rejection because the completion might not be awaited
    (0, stack_helpers_1.untrackPromise)(completePromise.catch(() => undefined));
    const ret = new Promise((resolve) => resolve([startPromise, completePromise]));
    (0, stack_helpers_1.untrackPromise)(ret);
    return ret;
}
function signalWorkflowNextHandler({ seq, signalName, args, target, headers }) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(() => {
                if (!activator.completions.signalWorkflow.has(seq)) {
                    return;
                }
                activator.pushCommand({ cancelSignalWorkflow: { seq } });
            }));
        }
        activator.pushCommand({
            signalExternalWorkflowExecution: {
                seq,
                args: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                signalName,
                ...(target.type === 'external'
                    ? {
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            ...target.workflowExecution,
                        },
                    }
                    : {
                        childWorkflowId: target.childWorkflowId,
                    }),
            },
        });
        activator.completions.signalWorkflow.set(seq, { resolve, reject });
    });
}
/**
 * Symbol used in the return type of proxy methods to mark that an attribute on the source type is not a method.
 *
 * @see {@link ActivityInterfaceFor}
 * @see {@link proxyActivities}
 * @see {@link proxyLocalActivities}
 */
exports.NotAnActivityMethod = Symbol.for('__TEMPORAL_NOT_AN_ACTIVITY_METHOD');
/**
 * Configure Activity functions with given {@link ActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy} for
 *         which each attribute is a callable Activity function
 *
 * @example
 * ```ts
 * import { proxyActivities } from '@temporalio/workflow';
 * import * as activities from '../activities';
 *
 * // Setup Activities from module exports
 * const { httpGet, otherActivity } = proxyActivities<typeof activities>({
 *   startToCloseTimeout: '30 minutes',
 * });
 *
 * // Setup Activities from an explicit interface (e.g. when defined by another SDK)
 * interface JavaActivities {
 *   httpGetFromJava(url: string): Promise<string>
 *   someOtherJavaActivity(arg1: number, arg2: string): Promise<string>;
 * }
 *
 * const {
 *   httpGetFromJava,
 *   someOtherJavaActivity
 * } = proxyActivities<JavaActivities>({
 *   taskQueue: 'java-worker-taskQueue',
 *   startToCloseTimeout: '5m',
 * });
 *
 * export function execute(): Promise<void> {
 *   const response = await httpGet("http://example.com");
 *   // ...
 * }
 * ```
 */
function proxyActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function activityProxyFunction(...args) {
                return scheduleActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyActivities = proxyActivities;
/**
 * Configure Local Activity functions with given {@link LocalActivityOptions}.
 *
 * This method may be called multiple times to setup Activities with different options.
 *
 * @return a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy | Proxy}
 *         for which each attribute is a callable Activity function
 *
 * @see {@link proxyActivities} for examples
 */
function proxyLocalActivities(options) {
    if (options === undefined) {
        throw new TypeError('options must be defined');
    }
    // Validate as early as possible for immediate user feedback
    validateLocalActivityOptions(options);
    return new Proxy({}, {
        get(_, activityType) {
            if (typeof activityType !== 'string') {
                throw new TypeError(`Only strings are supported for Activity types, got: ${String(activityType)}`);
            }
            return function localActivityProxyFunction(...args) {
                return scheduleLocalActivity(activityType, args, options);
            };
        },
    });
}
exports.proxyLocalActivities = proxyLocalActivities;
// TODO: deprecate this patch after "enough" time has passed
const EXTERNAL_WF_CANCEL_PATCH = '__temporal_internal_connect_external_handle_cancel_to_scope';
// The name of this patch comes from an attempt to build a generic internal patching mechanism.
// That effort has been abandoned in favor of a newer WorkflowTaskCompletedMetadata based mechanism.
const CONDITION_0_PATCH = '__sdk_internal_patch_number:1';
/**
 * Returns a client-side handle that can be used to signal and cancel an existing Workflow execution.
 * It takes a Workflow ID and optional run ID.
 */
function getExternalWorkflowHandle(workflowId, runId) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.getExternalWorkflowHandle(...) may only be used from a Workflow Execution. Consider using Client.workflow.getHandle(...) instead.)');
    return {
        workflowId,
        runId,
        cancel() {
            return new Promise((resolve, reject) => {
                // Connect this cancel operation to the current cancellation scope.
                // This is behavior was introduced after v0.22.0 and is incompatible
                // with histories generated with previous SDK versions and thus requires
                // patching.
                //
                // We try to delay patching as much as possible to avoid polluting
                // histories unless strictly required.
                const scope = cancellation_scope_1.CancellationScope.current();
                if (scope.cancellable) {
                    (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                        if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                            reject(err);
                        }
                    }));
                }
                if (scope.consideredCancelled) {
                    if (patched(EXTERNAL_WF_CANCEL_PATCH)) {
                        return;
                    }
                }
                const seq = activator.nextSeqs.cancelWorkflow++;
                activator.pushCommand({
                    requestCancelExternalWorkflowExecution: {
                        seq,
                        workflowExecution: {
                            namespace: activator.info.namespace,
                            workflowId,
                            runId,
                        },
                    },
                });
                activator.completions.cancelWorkflow.set(seq, { resolve, reject });
            });
        },
        signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'external',
                    workflowExecution: { workflowId, runId },
                },
                headers: {},
            });
        },
    };
}
exports.getExternalWorkflowHandle = getExternalWorkflowHandle;
async function startChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.startChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.start(...) instead.)');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const [started, completed] = await execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    const firstExecutionRunId = await started;
    return {
        workflowId: optionsWithDefaults.workflowId,
        firstExecutionRunId,
        async result() {
            return (await completed);
        },
        async signal(def, ...args) {
            return (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'signalWorkflow', signalWorkflowNextHandler)({
                seq: activator.nextSeqs.signalWorkflow++,
                signalName: typeof def === 'string' ? def : def.name,
                args,
                target: {
                    type: 'child',
                    childWorkflowId: optionsWithDefaults.workflowId,
                },
                headers: {},
            });
        },
    };
}
exports.startChild = startChild;
async function executeChild(workflowTypeOrFunc, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.executeChild(...) may only be used from a Workflow Execution. Consider using Client.workflow.execute(...) instead.');
    const optionsWithDefaults = addDefaultWorkflowOptions(options ?? {});
    const workflowType = (0, common_1.extractWorkflowType)(workflowTypeOrFunc);
    const execute = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'startChildWorkflowExecution', startChildWorkflowExecutionNextHandler);
    const execPromise = execute({
        seq: activator.nextSeqs.childWorkflow++,
        options: optionsWithDefaults,
        headers: {},
        workflowType,
    });
    (0, stack_helpers_1.untrackPromise)(execPromise);
    const completedPromise = execPromise.then(([_started, completed]) => completed);
    (0, stack_helpers_1.untrackPromise)(completedPromise);
    return completedPromise;
}
exports.executeChild = executeChild;
/**
 * Get information about the current Workflow.
 *
 * WARNING: This function returns a frozen copy of WorkflowInfo, at the point where this method has been called.
 * Changes happening at later point in workflow execution will not be reflected in the returned object.
 *
 * For this reason, we recommend calling `workflowInfo()` on every access to {@link WorkflowInfo}'s fields,
 * rather than caching the `WorkflowInfo` object (or part of it) in a local variable. For example:
 *
 * ```ts
 * // GOOD
 * function myWorkflow() {
 *   doSomething(workflowInfo().searchAttributes)
 *   ...
 *   doSomethingElse(workflowInfo().searchAttributes)
 * }
 * ```
 *
 * vs
 *
 * ```ts
 * // BAD
 * function myWorkflow() {
 *   const attributes = workflowInfo().searchAttributes
 *   doSomething(attributes)
 *   ...
 *   doSomethingElse(attributes)
 * }
 * ```
 */
function workflowInfo() {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.workflowInfo(...) may only be used from a Workflow Execution.');
    return activator.info;
}
exports.workflowInfo = workflowInfo;
/**
 * Returns whether or not code is executing in workflow context
 */
function inWorkflowContext() {
    return (0, global_attributes_1.maybeGetActivator)() !== undefined;
}
exports.inWorkflowContext = inWorkflowContext;
/**
 * Returns a function `f` that will cause the current Workflow to ContinueAsNew when called.
 *
 * `f` takes the same arguments as the Workflow function supplied to typeparam `F`.
 *
 * Once `f` is called, Workflow Execution immediately completes.
 */
function makeContinueAsNewFunc(options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.continueAsNew(...) and Workflow.makeContinueAsNewFunc(...) may only be used from a Workflow Execution.');
    const info = activator.info;
    const { workflowType, taskQueue, ...rest } = options ?? {};
    const requiredOptions = {
        workflowType: workflowType ?? info.workflowType,
        taskQueue: taskQueue ?? info.taskQueue,
        ...rest,
    };
    return (...args) => {
        const fn = (0, interceptors_1.composeInterceptors)(activator.interceptors.outbound, 'continueAsNew', async (input) => {
            const { headers, args, options } = input;
            throw new interfaces_1.ContinueAsNew({
                workflowType: options.workflowType,
                arguments: (0, common_1.toPayloads)(activator.payloadConverter, ...args),
                headers,
                taskQueue: options.taskQueue,
                memo: options.memo && (0, common_1.mapToPayloads)(activator.payloadConverter, options.memo),
                searchAttributes: options.searchAttributes
                    ? (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, options.searchAttributes)
                    : undefined,
                workflowRunTimeout: (0, time_1.msOptionalToTs)(options.workflowRunTimeout),
                workflowTaskTimeout: (0, time_1.msOptionalToTs)(options.workflowTaskTimeout),
                versioningIntent: (0, versioning_intent_enum_1.versioningIntentToProto)(options.versioningIntent),
            });
        });
        return fn({
            args,
            headers: {},
            options: requiredOptions,
        });
    };
}
exports.makeContinueAsNewFunc = makeContinueAsNewFunc;
/**
 * {@link https://docs.temporal.io/concepts/what-is-continue-as-new/ | Continues-As-New} the current Workflow Execution
 * with default options.
 *
 * Shorthand for `makeContinueAsNewFunc<F>()(...args)`. (See: {@link makeContinueAsNewFunc}.)
 *
 * @example
 *
 *```ts
 *import { continueAsNew } from '@temporalio/workflow';
 *
 *export async function myWorkflow(n: number): Promise<void> {
 *  // ... Workflow logic
 *  await continueAsNew<typeof myWorkflow>(n + 1);
 *}
 *```
 */
function continueAsNew(...args) {
    return makeContinueAsNewFunc()(...args);
}
exports.continueAsNew = continueAsNew;
/**
 * Generate an RFC compliant V4 uuid.
 * Uses the workflow's deterministic PRNG making it safe for use within a workflow.
 * This function is cryptographically insecure.
 * See the {@link https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid | stackoverflow discussion}.
 */
function uuid4() {
    // Return the hexadecimal text representation of number `n`, padded with zeroes to be of length `p`
    const ho = (n, p) => n.toString(16).padStart(p, '0');
    // Create a view backed by a 16-byte buffer
    const view = new DataView(new ArrayBuffer(16));
    // Fill buffer with random values
    view.setUint32(0, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(4, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(8, (Math.random() * 0x100000000) >>> 0);
    view.setUint32(12, (Math.random() * 0x100000000) >>> 0);
    // Patch the 6th byte to reflect a version 4 UUID
    view.setUint8(6, (view.getUint8(6) & 0xf) | 0x40);
    // Patch the 8th byte to reflect a variant 1 UUID (version 4 UUIDs are)
    view.setUint8(8, (view.getUint8(8) & 0x3f) | 0x80);
    // Compile the canonical textual form from the array data
    return `${ho(view.getUint32(0), 8)}-${ho(view.getUint16(4), 4)}-${ho(view.getUint16(6), 4)}-${ho(view.getUint16(8), 4)}-${ho(view.getUint32(10), 8)}${ho(view.getUint16(14), 4)}`;
}
exports.uuid4 = uuid4;
/**
 * Patch or upgrade workflow code by checking or stating that this workflow has a certain patch.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * If the workflow is replaying an existing history, then this function returns true if that
 * history was produced by a worker which also had a `patched` call with the same `patchId`.
 * If the history was produced by a worker *without* such a call, then it will return false.
 *
 * If the workflow is not currently replaying, then this call *always* returns true.
 *
 * Your workflow code should run the "new" code if this returns true, if it returns false, you
 * should run the "old" code. By doing this, you can maintain determinism.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function patched(patchId) {
    return patchInternal(patchId, false);
}
exports.patched = patched;
/**
 * Indicate that a patch is being phased out.
 *
 * See {@link https://docs.temporal.io/typescript/versioning | docs page} for info.
 *
 * Workflows with this call may be deployed alongside workflows with a {@link patched} call, but
 * they must *not* be deployed while any workers still exist running old code without a
 * {@link patched} call, or any runs with histories produced by such workers exist. If either kind
 * of worker encounters a history produced by the other, their behavior is undefined.
 *
 * Once all live workflow runs have been produced by workers with this call, you can deploy workers
 * which are free of either kind of patch call for this ID. Workers with and without this call
 * may coexist, as long as they are both running the "new" code.
 *
 * @param patchId An identifier that should be unique to this patch. It is OK to use multiple
 * calls with the same ID, which means all such calls will always return the same value.
 */
function deprecatePatch(patchId) {
    patchInternal(patchId, true);
}
exports.deprecatePatch = deprecatePatch;
function patchInternal(patchId, deprecated) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.patch(...) and Workflow.deprecatePatch may only be used from a Workflow Execution.');
    // Patch operation does not support interception at the moment, if it did,
    // this would be the place to start the interception chain
    if (activator.workflow === undefined) {
        throw new common_1.IllegalStateError('Patches cannot be used before Workflow starts');
    }
    const usePatch = !activator.info.unsafe.isReplaying || activator.knownPresentPatches.has(patchId);
    // Avoid sending commands for patches core already knows about.
    // This optimization enables development of automatic patching tools.
    if (usePatch && !activator.sentPatches.has(patchId)) {
        activator.pushCommand({
            setPatchMarker: { patchId, deprecated },
        });
        activator.sentPatches.add(patchId);
    }
    return usePatch;
}
async function condition(fn, timeout) {
    (0, global_attributes_1.assertInWorkflowContext)('Workflow.condition(...) may only be used from a Workflow Execution.');
    // Prior to 1.5.0, `condition(fn, 0)` was treated as equivalent to `condition(fn, undefined)`
    if (timeout === 0 && !patched(CONDITION_0_PATCH)) {
        return conditionInner(fn);
    }
    if (typeof timeout === 'number' || typeof timeout === 'string') {
        return cancellation_scope_1.CancellationScope.cancellable(async () => {
            try {
                return await Promise.race([sleep(timeout).then(() => false), conditionInner(fn).then(() => true)]);
            }
            finally {
                cancellation_scope_1.CancellationScope.current().cancel();
            }
        });
    }
    return conditionInner(fn);
}
exports.condition = condition;
function conditionInner(fn) {
    const activator = (0, global_attributes_1.getActivator)();
    return new Promise((resolve, reject) => {
        const scope = cancellation_scope_1.CancellationScope.current();
        if (scope.consideredCancelled) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch(reject));
            return;
        }
        const seq = activator.nextSeqs.condition++;
        if (scope.cancellable) {
            (0, stack_helpers_1.untrackPromise)(scope.cancelRequested.catch((err) => {
                activator.blockedConditions.delete(seq);
                reject(err);
            }));
        }
        // Eager evaluation
        if (fn()) {
            resolve();
            return;
        }
        activator.blockedConditions.set(seq, { fn, resolve });
    });
}
/**
 * Define an update method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to update Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineUpdate(name) {
    return {
        type: 'update',
        name,
    };
}
exports.defineUpdate = defineUpdate;
/**
 * Define a signal method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to signal Workflows using a {@link WorkflowHandle}, {@link ChildWorkflowHandle} or {@link ExternalWorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineSignal(name) {
    return {
        type: 'signal',
        name,
    };
}
exports.defineSignal = defineSignal;
/**
 * Define a query method for a Workflow.
 *
 * Definitions are used to register handler in the Workflow via {@link setHandler} and to query Workflows using a {@link WorkflowHandle}.
 * Definitions can be reused in multiple Workflows.
 */
function defineQuery(name) {
    return {
        type: 'query',
        name,
    };
}
exports.defineQuery = defineQuery;
// For Updates and Signals we want to make a public guarantee something like the
// following:
//
//   "If a WFT contains a Signal/Update, and if a handler is available for that
//   Signal/Update, then the handler will be executed.""
//
// However, that statement is not well-defined, leaving several questions open:
//
// 1. What does it mean for a handler to be "available"? What happens if the
//    handler is not present initially but is set at some point during the
//    Workflow code that is executed in that WFT? What happens if the handler is
//    set and then deleted, or replaced with a different handler?
//
// 2. When is the handler executed? (When it first becomes available? At the end
//    of the activation?) What are the execution semantics of Workflow and
//    Signal/Update handler code given that they are concurrent? Can the user
//    rely on Signal/Update side effects being reflected in the Workflow return
//    value, or in the value passed to Continue-As-New? If the handler is an
//    async function / coroutine, how much of it is executed and when is the
//    rest executed?
//
// 3. What happens if the handler is not executed? (i.e. because it wasn't
//    available in the sense defined by (1))
//
// 4. In the case of Update, when is the validation function executed?
//
// The implementation for Typescript is as follows:
//
// 1. sdk-core sorts Signal and Update jobs (and Patches) ahead of all other
//    jobs. Thus if the handler is available at the start of the Activation then
//    the Signal/Update will be executed before Workflow code is executed. If it
//    is not, then the Signal/Update calls is pushed to a buffer.
//
// 2. On each call to setHandler for a given Signal/Update, we make a pass
//    through the buffer list. If a buffered job is associated with the just-set
//    handler, then the job is removed from the buffer and the initial
//    synchronous portion of the handler is invoked on that input (i.e.
//    preempting workflow code).
//
// Thus in the case of Typescript the questions above are answered as follows:
//
// 1. A handler is "available" if it is set at the start of the Activation or
//    becomes set at any point during the Activation. If the handler is not set
//    initially then it is executed as soon as it is set. Subsequent deletion or
//    replacement by a different handler has no impact because the jobs it was
//    handling have already been handled and are no longer in the buffer.
//
// 2. The handler is executed as soon as it becomes available. I.e. if the
//    handler is set at the start of the Activation then it is executed when
//    first attempting to process the Signal/Update job; alternatively, if it is
//    set by a setHandler call made by Workflow code, then it is executed as
//    part of that call (preempting Workflow code). Therefore, a user can rely
//    on Signal/Update side effects being reflected in e.g. the Workflow return
//    value, and in the value passed to Continue-As-New. Activation jobs are
//    processed in the order supplied by sdk-core, i.e. Signals, then Updates,
//    then other jobs. Within each group, the order sent by the server is
//    preserved. If the handler is async, it is executed up to its first yield
//    point.
//
// 3. Signal case: If a handler does not become available for a Signal job then
//    the job remains in the buffer. If a handler for the Signal becomes
//    available in a subsequent Activation (of the same or a subsequent WFT)
//    then the handler will be executed. If not, then the Signal will never be
//    responded to and this causes no error.
//
//    Update case: If a handler does not become available for an Update job then
//    the Update is rejected at the end of the Activation. Thus, if a user does
//    not want an Update to be rejected for this reason, then it is their
//    responsibility to ensure that their application and workflow code interact
//    such that a handler is available for the Update during any Activation
//    which might contain their Update job. (Note that the user often has
//    uncertainty about which WFT their Signal/Update will appear in. For
//    example, if they call startWorkflow() followed by startUpdate(), then they
//    will typically not know whether these will be delivered in one or two
//    WFTs. On the other hand there are situations where they would have reason
//    to believe they are in the same WFT, for example if they do not start
//    Worker polling until after they have verified that both requests have
//    succeeded.)
//
// 5. If an Update has a validation function then it is executed immediately
//    prior to the handler. (Note that the validation function is required to be
//    synchronous).
function setHandler(def, handler, options) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setHandler(...) may only be used from a Workflow Execution.');
    const description = options?.description;
    if (def.type === 'update') {
        if (typeof handler === 'function') {
            const updateOptions = options;
            const validator = updateOptions?.validator;
            activator.updateHandlers.set(def.name, { handler, validator, description });
            activator.dispatchBufferedUpdates();
        }
        else if (handler == null) {
            activator.updateHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'signal') {
        if (typeof handler === 'function') {
            activator.signalHandlers.set(def.name, { handler: handler, description });
            activator.dispatchBufferedSignals();
        }
        else if (handler == null) {
            activator.signalHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else if (def.type === 'query') {
        if (typeof handler === 'function') {
            activator.queryHandlers.set(def.name, { handler: handler, description });
        }
        else if (handler == null) {
            activator.queryHandlers.delete(def.name);
        }
        else {
            throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
        }
    }
    else {
        throw new TypeError(`Invalid definition type: ${def.type}`);
    }
}
exports.setHandler = setHandler;
/**
 * Set a signal handler function that will handle signals calls for non-registered signal names.
 *
 * Signals are dispatched to the default signal handler in the order that they were accepted by the server.
 *
 * If this function is called multiple times for a given signal or query name the last handler will overwrite any previous calls.
 *
 * @param handler a function that will handle signals for non-registered signal names, or `undefined` to unset the handler.
 */
function setDefaultSignalHandler(handler) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.setDefaultSignalHandler(...) may only be used from a Workflow Execution.');
    if (typeof handler === 'function') {
        activator.defaultSignalHandler = handler;
        activator.dispatchBufferedSignals();
    }
    else if (handler == null) {
        activator.defaultSignalHandler = undefined;
    }
    else {
        throw new TypeError(`Expected handler to be either a function or 'undefined'. Got: '${typeof handler}'`);
    }
}
exports.setDefaultSignalHandler = setDefaultSignalHandler;
/**
 * Updates this Workflow's Search Attributes by merging the provided `searchAttributes` with the existing Search
 * Attributes, `workflowInfo().searchAttributes`.
 *
 * For example, this Workflow code:
 *
 * ```ts
 * upsertSearchAttributes({
 *   CustomIntField: [1],
 *   CustomBoolField: [true]
 * });
 * upsertSearchAttributes({
 *   CustomIntField: [42],
 *   CustomKeywordField: ['durable code', 'is great']
 * });
 * ```
 *
 * would result in the Workflow having these Search Attributes:
 *
 * ```ts
 * {
 *   CustomIntField: [42],
 *   CustomBoolField: [true],
 *   CustomKeywordField: ['durable code', 'is great']
 * }
 * ```
 *
 * @param searchAttributes The Record to merge. Use a value of `[]` to clear a Search Attribute.
 */
function upsertSearchAttributes(searchAttributes) {
    const activator = (0, global_attributes_1.assertInWorkflowContext)('Workflow.upsertSearchAttributes(...) may only be used from a Workflow Execution.');
    if (searchAttributes == null) {
        throw new Error('searchAttributes must be a non-null SearchAttributes');
    }
    activator.pushCommand({
        upsertWorkflowSearchAttributes: {
            searchAttributes: (0, common_1.mapToPayloads)(common_1.searchAttributePayloadConverter, searchAttributes),
        },
    });
    activator.mutateWorkflowInfo((info) => {
        return {
            ...info,
            searchAttributes: {
                ...info.searchAttributes,
                ...searchAttributes,
            },
        };
    });
}
exports.upsertSearchAttributes = upsertSearchAttributes;
exports.stackTraceQuery = defineQuery('__stack_trace');
exports.enhancedStackTraceQuery = defineQuery('__enhanced_stack_trace');
exports.workflowMetadataQuery = defineQuery('__temporal_workflow_metadata');


/***/ }),

/***/ "./src/workflows.ts":
/*!**************************!*\
  !*** ./src/workflows.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   rebalanceWorkflow: () => (/* binding */ rebalanceWorkflow)
/* harmony export */ });
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @temporalio/workflow */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/index.js");
/* harmony import */ var _temporalio_workflow__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__);

const activityInitialRetryInterval = 1000;
// Instantiate the activities
const { greet, doPlannedTxStep, mintTestNft, executeStrategy } = (0,_temporalio_workflow__WEBPACK_IMPORTED_MODULE_0__.proxyActivities)({
    startToCloseTimeout: "1 hour",
    heartbeatTimeout: "2 minutes",
    retry: {
        // default retry policy if not specified
        initialInterval: "60s",
        backoffCoefficient: 2,
        maximumAttempts: 1,
        maximumInterval: 100 * activityInitialRetryInterval,
        nonRetryableErrorTypes: []
    }
});
// Compose workflow with activities
const rebalanceWorkflow = async (rebalanceArgs)=>{
    // for this exercise, lets just swap 1 USDC to 1 DAI every hour.
    console.log("temporal worker: running rebalance workflow [start]");
    // const txSteps = rebalanceArgs.plannedTransactionSteps
    // const mintRes = await mintTestNft(rebalanceArgs.strategyInstanceId);
    const swapRes = await executeStrategy(rebalanceArgs.strategyInstanceId);
    console.log("Temporal worker: swap result", swapRes);
    // for (let progress = 1; progress <= 1000; ++progress) {
    //   await Context.current().sleep(1000)
    //   // record activity heartbeat
    //   Context.current().heartbeat()
    // }
    // for (let i = 0; i < txSteps.length; i++ ) {
    //   // remember this contains a sequence-sensitive array of txs
    //   const txSequence = txSteps[i]!
    //   // do prework here to map out amounts (it probably shouldnt end up here (prob do this upstream?), but we can sketch it out here)
    //   // eventually....
    //   const txsInStepSequence = txSequence.txs;
    //   for (let j = 0; j < txsInStepSequence.length; j++) {
    //     const plannedTx = txsInStepSequence[j]!
    //     try {
    //       await doPlannedTxStep(plannedTx)
    //     } catch (e) {
    //     }
    //   }
    //   // txStepExecution activity ?
    // }
    // do any selling
    // do any bridging
    // do any buying...
    // await greet(text)
    // await greet_es(text)
    // await addReminderToDatabase(text);
    // await notifyUser(text);
    console.log("temporal worker: running rebalance workflow [end]");
    return {
        success: true
    };
};


/***/ }),

/***/ "?7975":
/*!*****************************************************!*\
  !*** __temporal_custom_failure_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?4bb4":
/*!*****************************************************!*\
  !*** __temporal_custom_payload_converter (ignored) ***!
  \*****************************************************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "../../node_modules/.pnpm/ms@3.0.0-canary.1/node_modules/ms/dist/index.cjs":
/*!*********************************************************************************!*\
  !*** ../../node_modules/.pnpm/ms@3.0.0-canary.1/node_modules/ms/dist/index.cjs ***!
  \*********************************************************************************/
/***/ ((module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
// Helpers.
const s = 1000;
const m = s * 60;
const h = m * 60;
const d = h * 24;
const w = d * 7;
const y = d * 365.25;
function ms(value, options) {
    try {
        if (typeof value === 'string' && value.length > 0) {
            return parse(value);
        }
        else if (typeof value === 'number' && isFinite(value)) {
            return options?.long ? fmtLong(value) : fmtShort(value);
        }
        throw new Error('Value is not a string or number.');
    }
    catch (error) {
        const message = isError(error)
            ? `${error.message}. value=${JSON.stringify(value)}`
            : 'An unknown error has occured.';
        throw new Error(message);
    }
}
/**
 * Parse the given `str` and return milliseconds.
 */
function parse(str) {
    str = String(str);
    if (str.length > 100) {
        throw new Error('Value exceeds the maximum length of 100 characters.');
    }
    const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
    if (!match) {
        return NaN;
    }
    const n = parseFloat(match[1]);
    const type = (match[2] || 'ms').toLowerCase();
    switch (type) {
        case 'years':
        case 'year':
        case 'yrs':
        case 'yr':
        case 'y':
            return n * y;
        case 'weeks':
        case 'week':
        case 'w':
            return n * w;
        case 'days':
        case 'day':
        case 'd':
            return n * d;
        case 'hours':
        case 'hour':
        case 'hrs':
        case 'hr':
        case 'h':
            return n * h;
        case 'minutes':
        case 'minute':
        case 'mins':
        case 'min':
        case 'm':
            return n * m;
        case 'seconds':
        case 'second':
        case 'secs':
        case 'sec':
        case 's':
            return n * s;
        case 'milliseconds':
        case 'millisecond':
        case 'msecs':
        case 'msec':
        case 'ms':
            return n;
        default:
            // This should never occur.
            throw new Error(`The unit ${type} was matched, but no matching case exists.`);
    }
}
exports["default"] = ms;
/**
 * Short format for `ms`.
 */
function fmtShort(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return `${Math.round(ms / d)}d`;
    }
    if (msAbs >= h) {
        return `${Math.round(ms / h)}h`;
    }
    if (msAbs >= m) {
        return `${Math.round(ms / m)}m`;
    }
    if (msAbs >= s) {
        return `${Math.round(ms / s)}s`;
    }
    return `${ms}ms`;
}
/**
 * Long format for `ms`.
 */
function fmtLong(ms) {
    const msAbs = Math.abs(ms);
    if (msAbs >= d) {
        return plural(ms, msAbs, d, 'day');
    }
    if (msAbs >= h) {
        return plural(ms, msAbs, h, 'hour');
    }
    if (msAbs >= m) {
        return plural(ms, msAbs, m, 'minute');
    }
    if (msAbs >= s) {
        return plural(ms, msAbs, s, 'second');
    }
    return `${ms} ms`;
}
/**
 * Pluralization helper.
 */
function plural(ms, msAbs, n, name) {
    const isPlural = msAbs >= n * 1.5;
    return `${Math.round(ms / n)} ${name}${isPlural ? 's' : ''}`;
}
/**
 * A type guard for errors.
 */
function isError(error) {
    return typeof error === 'object' && error !== null && 'message' in error;
}
module.exports = exports.default;
module.exports["default"] = exports.default;


/***/ }),

/***/ "../../node_modules/.pnpm/long@5.2.3/node_modules/long/umd/index.js":
/*!**************************************************************************!*\
  !*** ../../node_modules/.pnpm/long@5.2.3/node_modules/long/umd/index.js ***!
  \**************************************************************************/
/***/ ((module, exports) => {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;// GENERATED FILE. DO NOT EDIT.
var Long = (function(exports) {
  "use strict";
  
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = void 0;
  
  /**
   * @license
   * Copyright 2009 The Closure Library Authors
   * Copyright 2020 Daniel Wirtz / The long.js Authors.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   *     http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * SPDX-License-Identifier: Apache-2.0
   */
  // WebAssembly optimizations to do native i64 multiplication and divide
  var wasm = null;
  
  try {
    wasm = new WebAssembly.Instance(new WebAssembly.Module(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 13, 2, 96, 0, 1, 127, 96, 4, 127, 127, 127, 127, 1, 127, 3, 7, 6, 0, 1, 1, 1, 1, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 50, 6, 3, 109, 117, 108, 0, 1, 5, 100, 105, 118, 95, 115, 0, 2, 5, 100, 105, 118, 95, 117, 0, 3, 5, 114, 101, 109, 95, 115, 0, 4, 5, 114, 101, 109, 95, 117, 0, 5, 8, 103, 101, 116, 95, 104, 105, 103, 104, 0, 0, 10, 191, 1, 6, 4, 0, 35, 0, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 126, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 127, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 128, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 129, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11, 36, 1, 1, 126, 32, 0, 173, 32, 1, 173, 66, 32, 134, 132, 32, 2, 173, 32, 3, 173, 66, 32, 134, 132, 130, 34, 4, 66, 32, 135, 167, 36, 0, 32, 4, 167, 11])), {}).exports;
  } catch (e) {// no wasm support :(
  }
  /**
   * Constructs a 64 bit two's-complement integer, given its low and high 32 bit values as *signed* integers.
   *  See the from* functions below for more convenient ways of constructing Longs.
   * @exports Long
   * @class A Long class for representing a 64 bit two's-complement integer value.
   * @param {number} low The low (signed) 32 bits of the long
   * @param {number} high The high (signed) 32 bits of the long
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @constructor
   */
  
  
  function Long(low, high, unsigned) {
    /**
     * The low 32 bits as a signed value.
     * @type {number}
     */
    this.low = low | 0;
    /**
     * The high 32 bits as a signed value.
     * @type {number}
     */
  
    this.high = high | 0;
    /**
     * Whether unsigned or not.
     * @type {boolean}
     */
  
    this.unsigned = !!unsigned;
  } // The internal representation of a long is the two given signed, 32-bit values.
  // We use 32-bit pieces because these are the size of integers on which
  // Javascript performs bit-operations.  For operations like addition and
  // multiplication, we split each number into 16 bit pieces, which can easily be
  // multiplied within Javascript's floating-point representation without overflow
  // or change in sign.
  //
  // In the algorithms below, we frequently reduce the negative case to the
  // positive case by negating the input(s) and then post-processing the result.
  // Note that we must ALWAYS check specially whether those values are MIN_VALUE
  // (-2^63) because -MIN_VALUE == MIN_VALUE (since 2^63 cannot be represented as
  // a positive number, it overflows back into a negative).  Not handling this
  // case would often result in infinite recursion.
  //
  // Common constant values ZERO, ONE, NEG_ONE, etc. are defined below the from*
  // methods on which they depend.
  
  /**
   * An indicator used to reliably determine if an object is a Long or not.
   * @type {boolean}
   * @const
   * @private
   */
  
  
  Long.prototype.__isLong__;
  Object.defineProperty(Long.prototype, "__isLong__", {
    value: true
  });
  /**
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   * @inner
   */
  
  function isLong(obj) {
    return (obj && obj["__isLong__"]) === true;
  }
  /**
   * @function
   * @param {*} value number
   * @returns {number}
   * @inner
   */
  
  
  function ctz32(value) {
    var c = Math.clz32(value & -value);
    return value ? 31 - c : c;
  }
  /**
   * Tests if the specified object is a Long.
   * @function
   * @param {*} obj Object
   * @returns {boolean}
   */
  
  
  Long.isLong = isLong;
  /**
   * A cache of the Long representations of small integer values.
   * @type {!Object}
   * @inner
   */
  
  var INT_CACHE = {};
  /**
   * A cache of the Long representations of small unsigned integer values.
   * @type {!Object}
   * @inner
   */
  
  var UINT_CACHE = {};
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromInt(value, unsigned) {
    var obj, cachedObj, cache;
  
    if (unsigned) {
      value >>>= 0;
  
      if (cache = 0 <= value && value < 256) {
        cachedObj = UINT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, 0, true);
      if (cache) UINT_CACHE[value] = obj;
      return obj;
    } else {
      value |= 0;
  
      if (cache = -128 <= value && value < 128) {
        cachedObj = INT_CACHE[value];
        if (cachedObj) return cachedObj;
      }
  
      obj = fromBits(value, value < 0 ? -1 : 0, false);
      if (cache) INT_CACHE[value] = obj;
      return obj;
    }
  }
  /**
   * Returns a Long representing the given 32 bit integer value.
   * @function
   * @param {number} value The 32 bit integer in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromInt = fromInt;
  /**
   * @param {number} value
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromNumber(value, unsigned) {
    if (isNaN(value)) return unsigned ? UZERO : ZERO;
  
    if (unsigned) {
      if (value < 0) return UZERO;
      if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    } else {
      if (value <= -TWO_PWR_63_DBL) return MIN_VALUE;
      if (value + 1 >= TWO_PWR_63_DBL) return MAX_VALUE;
    }
  
    if (value < 0) return fromNumber(-value, unsigned).neg();
    return fromBits(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0, unsigned);
  }
  /**
   * Returns a Long representing the given value, provided that it is a finite number. Otherwise, zero is returned.
   * @function
   * @param {number} value The number in question
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromNumber = fromNumber;
  /**
   * @param {number} lowBits
   * @param {number} highBits
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromBits(lowBits, highBits, unsigned) {
    return new Long(lowBits, highBits, unsigned);
  }
  /**
   * Returns a Long representing the 64 bit integer that comes by concatenating the given low and high bits. Each is
   *  assumed to use 32 bits.
   * @function
   * @param {number} lowBits The low 32 bits
   * @param {number} highBits The high 32 bits
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromBits = fromBits;
  /**
   * @function
   * @param {number} base
   * @param {number} exponent
   * @returns {number}
   * @inner
   */
  
  var pow_dbl = Math.pow; // Used 4 times (4*8 to 15+4)
  
  /**
   * @param {string} str
   * @param {(boolean|number)=} unsigned
   * @param {number=} radix
   * @returns {!Long}
   * @inner
   */
  
  function fromString(str, unsigned, radix) {
    if (str.length === 0) throw Error('empty string');
  
    if (typeof unsigned === 'number') {
      // For goog.math.long compatibility
      radix = unsigned;
      unsigned = false;
    } else {
      unsigned = !!unsigned;
    }
  
    if (str === "NaN" || str === "Infinity" || str === "+Infinity" || str === "-Infinity") return unsigned ? UZERO : ZERO;
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    var p;
    if ((p = str.indexOf('-')) > 0) throw Error('interior hyphen');else if (p === 0) {
      return fromString(str.substring(1), unsigned, radix).neg();
    } // Do several (8) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
    var radixToPower = fromNumber(pow_dbl(radix, 8));
    var result = ZERO;
  
    for (var i = 0; i < str.length; i += 8) {
      var size = Math.min(8, str.length - i),
          value = parseInt(str.substring(i, i + size), radix);
  
      if (size < 8) {
        var power = fromNumber(pow_dbl(radix, size));
        result = result.mul(power).add(fromNumber(value));
      } else {
        result = result.mul(radixToPower);
        result = result.add(fromNumber(value));
      }
    }
  
    result.unsigned = unsigned;
    return result;
  }
  /**
   * Returns a Long representation of the given string, written using the specified radix.
   * @function
   * @param {string} str The textual representation of the Long
   * @param {(boolean|number)=} unsigned Whether unsigned or not, defaults to signed
   * @param {number=} radix The radix in which the text is written (2-36), defaults to 10
   * @returns {!Long} The corresponding Long value
   */
  
  
  Long.fromString = fromString;
  /**
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val
   * @param {boolean=} unsigned
   * @returns {!Long}
   * @inner
   */
  
  function fromValue(val, unsigned) {
    if (typeof val === 'number') return fromNumber(val, unsigned);
    if (typeof val === 'string') return fromString(val, unsigned); // Throws for non-objects, converts non-instanceof Long:
  
    return fromBits(val.low, val.high, typeof unsigned === 'boolean' ? unsigned : val.unsigned);
  }
  /**
   * Converts the specified value to a Long using the appropriate from* function for its type.
   * @function
   * @param {!Long|number|string|!{low: number, high: number, unsigned: boolean}} val Value
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {!Long}
   */
  
  
  Long.fromValue = fromValue; // NOTE: the compiler should inline these constant values below and then remove these variables, so there should be
  // no runtime penalty for these.
  
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_16_DBL = 1 << 16;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_24_DBL = 1 << 24;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
  /**
   * @type {number}
   * @const
   * @inner
   */
  
  var TWO_PWR_63_DBL = TWO_PWR_64_DBL / 2;
  /**
   * @type {!Long}
   * @const
   * @inner
   */
  
  var TWO_PWR_24 = fromInt(TWO_PWR_24_DBL);
  /**
   * @type {!Long}
   * @inner
   */
  
  var ZERO = fromInt(0);
  /**
   * Signed zero.
   * @type {!Long}
   */
  
  Long.ZERO = ZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UZERO = fromInt(0, true);
  /**
   * Unsigned zero.
   * @type {!Long}
   */
  
  Long.UZERO = UZERO;
  /**
   * @type {!Long}
   * @inner
   */
  
  var ONE = fromInt(1);
  /**
   * Signed one.
   * @type {!Long}
   */
  
  Long.ONE = ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var UONE = fromInt(1, true);
  /**
   * Unsigned one.
   * @type {!Long}
   */
  
  Long.UONE = UONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var NEG_ONE = fromInt(-1);
  /**
   * Signed negative one.
   * @type {!Long}
   */
  
  Long.NEG_ONE = NEG_ONE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_VALUE = fromBits(0xFFFFFFFF | 0, 0x7FFFFFFF | 0, false);
  /**
   * Maximum signed value.
   * @type {!Long}
   */
  
  Long.MAX_VALUE = MAX_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MAX_UNSIGNED_VALUE = fromBits(0xFFFFFFFF | 0, 0xFFFFFFFF | 0, true);
  /**
   * Maximum unsigned value.
   * @type {!Long}
   */
  
  Long.MAX_UNSIGNED_VALUE = MAX_UNSIGNED_VALUE;
  /**
   * @type {!Long}
   * @inner
   */
  
  var MIN_VALUE = fromBits(0, 0x80000000 | 0, false);
  /**
   * Minimum signed value.
   * @type {!Long}
   */
  
  Long.MIN_VALUE = MIN_VALUE;
  /**
   * @alias Long.prototype
   * @inner
   */
  
  var LongPrototype = Long.prototype;
  /**
   * Converts the Long to a 32 bit integer, assuming it is a 32 bit integer.
   * @this {!Long}
   * @returns {number}
   */
  
  LongPrototype.toInt = function toInt() {
    return this.unsigned ? this.low >>> 0 : this.low;
  };
  /**
   * Converts the Long to a the nearest floating-point representation of this value (double, 53 bit mantissa).
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.toNumber = function toNumber() {
    if (this.unsigned) return (this.high >>> 0) * TWO_PWR_32_DBL + (this.low >>> 0);
    return this.high * TWO_PWR_32_DBL + (this.low >>> 0);
  };
  /**
   * Converts the Long to a string written in the specified radix.
   * @this {!Long}
   * @param {number=} radix Radix (2-36), defaults to 10
   * @returns {string}
   * @override
   * @throws {RangeError} If `radix` is out of range
   */
  
  
  LongPrototype.toString = function toString(radix) {
    radix = radix || 10;
    if (radix < 2 || 36 < radix) throw RangeError('radix');
    if (this.isZero()) return '0';
  
    if (this.isNegative()) {
      // Unsigned Longs are never negative
      if (this.eq(MIN_VALUE)) {
        // We need to change the Long value before it can be negated, so we remove
        // the bottom-most digit in this base and then recurse to do the rest.
        var radixLong = fromNumber(radix),
            div = this.div(radixLong),
            rem1 = div.mul(radixLong).sub(this);
        return div.toString(radix) + rem1.toInt().toString(radix);
      } else return '-' + this.neg().toString(radix);
    } // Do several (6) digits each time through the loop, so as to
    // minimize the calls to the very expensive emulated div.
  
  
    var radixToPower = fromNumber(pow_dbl(radix, 6), this.unsigned),
        rem = this;
    var result = '';
  
    while (true) {
      var remDiv = rem.div(radixToPower),
          intval = rem.sub(remDiv.mul(radixToPower)).toInt() >>> 0,
          digits = intval.toString(radix);
      rem = remDiv;
      if (rem.isZero()) return digits + result;else {
        while (digits.length < 6) digits = '0' + digits;
  
        result = '' + digits + result;
      }
    }
  };
  /**
   * Gets the high 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed high bits
   */
  
  
  LongPrototype.getHighBits = function getHighBits() {
    return this.high;
  };
  /**
   * Gets the high 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned high bits
   */
  
  
  LongPrototype.getHighBitsUnsigned = function getHighBitsUnsigned() {
    return this.high >>> 0;
  };
  /**
   * Gets the low 32 bits as a signed integer.
   * @this {!Long}
   * @returns {number} Signed low bits
   */
  
  
  LongPrototype.getLowBits = function getLowBits() {
    return this.low;
  };
  /**
   * Gets the low 32 bits as an unsigned integer.
   * @this {!Long}
   * @returns {number} Unsigned low bits
   */
  
  
  LongPrototype.getLowBitsUnsigned = function getLowBitsUnsigned() {
    return this.low >>> 0;
  };
  /**
   * Gets the number of bits needed to represent the absolute value of this Long.
   * @this {!Long}
   * @returns {number}
   */
  
  
  LongPrototype.getNumBitsAbs = function getNumBitsAbs() {
    if (this.isNegative()) // Unsigned Longs are never negative
      return this.eq(MIN_VALUE) ? 64 : this.neg().getNumBitsAbs();
    var val = this.high != 0 ? this.high : this.low;
  
    for (var bit = 31; bit > 0; bit--) if ((val & 1 << bit) != 0) break;
  
    return this.high != 0 ? bit + 33 : bit + 1;
  };
  /**
   * Tests if this Long's value equals zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isZero = function isZero() {
    return this.high === 0 && this.low === 0;
  };
  /**
   * Tests if this Long's value equals zero. This is an alias of {@link Long#isZero}.
   * @returns {boolean}
   */
  
  
  LongPrototype.eqz = LongPrototype.isZero;
  /**
   * Tests if this Long's value is negative.
   * @this {!Long}
   * @returns {boolean}
   */
  
  LongPrototype.isNegative = function isNegative() {
    return !this.unsigned && this.high < 0;
  };
  /**
   * Tests if this Long's value is positive or zero.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isPositive = function isPositive() {
    return this.unsigned || this.high >= 0;
  };
  /**
   * Tests if this Long's value is odd.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isOdd = function isOdd() {
    return (this.low & 1) === 1;
  };
  /**
   * Tests if this Long's value is even.
   * @this {!Long}
   * @returns {boolean}
   */
  
  
  LongPrototype.isEven = function isEven() {
    return (this.low & 1) === 0;
  };
  /**
   * Tests if this Long's value equals the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.equals = function equals(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.unsigned !== other.unsigned && this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  };
  /**
   * Tests if this Long's value equals the specified's. This is an alias of {@link Long#equals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.eq = LongPrototype.equals;
  /**
   * Tests if this Long's value differs from the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.notEquals = function notEquals(other) {
    return !this.eq(
    /* validates */
    other);
  };
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.neq = LongPrototype.notEquals;
  /**
   * Tests if this Long's value differs from the specified's. This is an alias of {@link Long#notEquals}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ne = LongPrototype.notEquals;
  /**
   * Tests if this Long's value is less than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThan = function lessThan(other) {
    return this.comp(
    /* validates */
    other) < 0;
  };
  /**
   * Tests if this Long's value is less than the specified's. This is an alias of {@link Long#lessThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lt = LongPrototype.lessThan;
  /**
   * Tests if this Long's value is less than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.lessThanOrEqual = function lessThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) <= 0;
  };
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.lte = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is less than or equal the specified's. This is an alias of {@link Long#lessThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.le = LongPrototype.lessThanOrEqual;
  /**
   * Tests if this Long's value is greater than the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThan = function greaterThan(other) {
    return this.comp(
    /* validates */
    other) > 0;
  };
  /**
   * Tests if this Long's value is greater than the specified's. This is an alias of {@link Long#greaterThan}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gt = LongPrototype.greaterThan;
  /**
   * Tests if this Long's value is greater than or equal the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.greaterThanOrEqual = function greaterThanOrEqual(other) {
    return this.comp(
    /* validates */
    other) >= 0;
  };
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  
  LongPrototype.gte = LongPrototype.greaterThanOrEqual;
  /**
   * Tests if this Long's value is greater than or equal the specified's. This is an alias of {@link Long#greaterThanOrEqual}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {boolean}
   */
  
  LongPrototype.ge = LongPrototype.greaterThanOrEqual;
  /**
   * Compares this Long's value with the specified's.
   * @this {!Long}
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  LongPrototype.compare = function compare(other) {
    if (!isLong(other)) other = fromValue(other);
    if (this.eq(other)) return 0;
    var thisNeg = this.isNegative(),
        otherNeg = other.isNegative();
    if (thisNeg && !otherNeg) return -1;
    if (!thisNeg && otherNeg) return 1; // At this point the sign bits are the same
  
    if (!this.unsigned) return this.sub(other).isNegative() ? -1 : 1; // Both are positive if at least one is unsigned
  
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  };
  /**
   * Compares this Long's value with the specified's. This is an alias of {@link Long#compare}.
   * @function
   * @param {!Long|number|string} other Other value
   * @returns {number} 0 if they are the same, 1 if the this is greater and -1
   *  if the given one is greater
   */
  
  
  LongPrototype.comp = LongPrototype.compare;
  /**
   * Negates this Long's value.
   * @this {!Long}
   * @returns {!Long} Negated Long
   */
  
  LongPrototype.negate = function negate() {
    if (!this.unsigned && this.eq(MIN_VALUE)) return MIN_VALUE;
    return this.not().add(ONE);
  };
  /**
   * Negates this Long's value. This is an alias of {@link Long#negate}.
   * @function
   * @returns {!Long} Negated Long
   */
  
  
  LongPrototype.neg = LongPrototype.negate;
  /**
   * Returns the sum of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} addend Addend
   * @returns {!Long} Sum
   */
  
  LongPrototype.add = function add(addend) {
    if (!isLong(addend)) addend = fromValue(addend); // Divide each number into 4 chunks of 16 bits, and then sum the chunks.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = addend.high >>> 16;
    var b32 = addend.high & 0xFFFF;
    var b16 = addend.low >>> 16;
    var b00 = addend.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 + b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 + b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 + b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 + b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the difference of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.subtract = function subtract(subtrahend) {
    if (!isLong(subtrahend)) subtrahend = fromValue(subtrahend);
    return this.add(subtrahend.neg());
  };
  /**
   * Returns the difference of this and the specified Long. This is an alias of {@link Long#subtract}.
   * @function
   * @param {!Long|number|string} subtrahend Subtrahend
   * @returns {!Long} Difference
   */
  
  
  LongPrototype.sub = LongPrototype.subtract;
  /**
   * Returns the product of this and the specified Long.
   * @this {!Long}
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  LongPrototype.multiply = function multiply(multiplier) {
    if (this.isZero()) return this;
    if (!isLong(multiplier)) multiplier = fromValue(multiplier); // use wasm support if present
  
    if (wasm) {
      var low = wasm["mul"](this.low, this.high, multiplier.low, multiplier.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (multiplier.isZero()) return this.unsigned ? UZERO : ZERO;
    if (this.eq(MIN_VALUE)) return multiplier.isOdd() ? MIN_VALUE : ZERO;
    if (multiplier.eq(MIN_VALUE)) return this.isOdd() ? MIN_VALUE : ZERO;
  
    if (this.isNegative()) {
      if (multiplier.isNegative()) return this.neg().mul(multiplier.neg());else return this.neg().mul(multiplier).neg();
    } else if (multiplier.isNegative()) return this.mul(multiplier.neg()).neg(); // If both longs are small, use float multiplication
  
  
    if (this.lt(TWO_PWR_24) && multiplier.lt(TWO_PWR_24)) return fromNumber(this.toNumber() * multiplier.toNumber(), this.unsigned); // Divide each long into 4 chunks of 16 bits, and then add up 4x4 products.
    // We can skip products that would overflow.
  
    var a48 = this.high >>> 16;
    var a32 = this.high & 0xFFFF;
    var a16 = this.low >>> 16;
    var a00 = this.low & 0xFFFF;
    var b48 = multiplier.high >>> 16;
    var b32 = multiplier.high & 0xFFFF;
    var b16 = multiplier.low >>> 16;
    var b00 = multiplier.low & 0xFFFF;
    var c48 = 0,
        c32 = 0,
        c16 = 0,
        c00 = 0;
    c00 += a00 * b00;
    c16 += c00 >>> 16;
    c00 &= 0xFFFF;
    c16 += a16 * b00;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c16 += a00 * b16;
    c32 += c16 >>> 16;
    c16 &= 0xFFFF;
    c32 += a32 * b00;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a16 * b16;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c32 += a00 * b32;
    c48 += c32 >>> 16;
    c32 &= 0xFFFF;
    c48 += a48 * b00 + a32 * b16 + a16 * b32 + a00 * b48;
    c48 &= 0xFFFF;
    return fromBits(c16 << 16 | c00, c48 << 16 | c32, this.unsigned);
  };
  /**
   * Returns the product of this and the specified Long. This is an alias of {@link Long#multiply}.
   * @function
   * @param {!Long|number|string} multiplier Multiplier
   * @returns {!Long} Product
   */
  
  
  LongPrototype.mul = LongPrototype.multiply;
  /**
   * Returns this Long divided by the specified. The result is signed if this Long is signed or
   *  unsigned if this Long is unsigned.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  LongPrototype.divide = function divide(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor);
    if (divisor.isZero()) throw Error('division by zero'); // use wasm support if present
  
    if (wasm) {
      // guard against signed division overflow: the largest
      // negative number / -1 would be 1 larger than the largest
      // positive number, due to two's complement.
      if (!this.unsigned && this.high === -0x80000000 && divisor.low === -1 && divisor.high === -1) {
        // be consistent with non-wasm code path
        return this;
      }
  
      var low = (this.unsigned ? wasm["div_u"] : wasm["div_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    if (this.isZero()) return this.unsigned ? UZERO : ZERO;
    var approx, rem, res;
  
    if (!this.unsigned) {
      // This section is only relevant for signed longs and is derived from the
      // closure library as a whole.
      if (this.eq(MIN_VALUE)) {
        if (divisor.eq(ONE) || divisor.eq(NEG_ONE)) return MIN_VALUE; // recall that -MIN_VALUE == MIN_VALUE
        else if (divisor.eq(MIN_VALUE)) return ONE;else {
          // At this point, we have |other| >= 2, so |this/other| < |MIN_VALUE|.
          var halfThis = this.shr(1);
          approx = halfThis.div(divisor).shl(1);
  
          if (approx.eq(ZERO)) {
            return divisor.isNegative() ? ONE : NEG_ONE;
          } else {
            rem = this.sub(divisor.mul(approx));
            res = approx.add(rem.div(divisor));
            return res;
          }
        }
      } else if (divisor.eq(MIN_VALUE)) return this.unsigned ? UZERO : ZERO;
  
      if (this.isNegative()) {
        if (divisor.isNegative()) return this.neg().div(divisor.neg());
        return this.neg().div(divisor).neg();
      } else if (divisor.isNegative()) return this.div(divisor.neg()).neg();
  
      res = ZERO;
    } else {
      // The algorithm below has not been made for unsigned longs. It's therefore
      // required to take special care of the MSB prior to running it.
      if (!divisor.unsigned) divisor = divisor.toUnsigned();
      if (divisor.gt(this)) return UZERO;
      if (divisor.gt(this.shru(1))) // 15 >>> 1 = 7 ; with divisor = 8 ; true
        return UONE;
      res = UZERO;
    } // Repeat the following until the remainder is less than other:  find a
    // floating-point that approximates remainder / other *from below*, add this
    // into the result, and subtract it from the remainder.  It is critical that
    // the approximate value is less than or equal to the real value so that the
    // remainder never becomes negative.
  
  
    rem = this;
  
    while (rem.gte(divisor)) {
      // Approximate the result of division. This may be a little greater or
      // smaller than the actual value.
      approx = Math.max(1, Math.floor(rem.toNumber() / divisor.toNumber())); // We will tweak the approximate result by changing it in the 48-th digit or
      // the smallest non-fractional digit, whichever is larger.
  
      var log2 = Math.ceil(Math.log(approx) / Math.LN2),
          delta = log2 <= 48 ? 1 : pow_dbl(2, log2 - 48),
          // Decrease the approximation until it is smaller than the remainder.  Note
      // that if it is too large, the product overflows and is negative.
      approxRes = fromNumber(approx),
          approxRem = approxRes.mul(divisor);
  
      while (approxRem.isNegative() || approxRem.gt(rem)) {
        approx -= delta;
        approxRes = fromNumber(approx, this.unsigned);
        approxRem = approxRes.mul(divisor);
      } // We know the answer can't be zero... and actually, zero would cause
      // infinite recursion since we would make no progress.
  
  
      if (approxRes.isZero()) approxRes = ONE;
      res = res.add(approxRes);
      rem = rem.sub(approxRem);
    }
  
    return res;
  };
  /**
   * Returns this Long divided by the specified. This is an alias of {@link Long#divide}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Quotient
   */
  
  
  LongPrototype.div = LongPrototype.divide;
  /**
   * Returns this Long modulo the specified.
   * @this {!Long}
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.modulo = function modulo(divisor) {
    if (!isLong(divisor)) divisor = fromValue(divisor); // use wasm support if present
  
    if (wasm) {
      var low = (this.unsigned ? wasm["rem_u"] : wasm["rem_s"])(this.low, this.high, divisor.low, divisor.high);
      return fromBits(low, wasm["get_high"](), this.unsigned);
    }
  
    return this.sub(this.div(divisor).mul(divisor));
  };
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  
  LongPrototype.mod = LongPrototype.modulo;
  /**
   * Returns this Long modulo the specified. This is an alias of {@link Long#modulo}.
   * @function
   * @param {!Long|number|string} divisor Divisor
   * @returns {!Long} Remainder
   */
  
  LongPrototype.rem = LongPrototype.modulo;
  /**
   * Returns the bitwise NOT of this Long.
   * @this {!Long}
   * @returns {!Long}
   */
  
  LongPrototype.not = function not() {
    return fromBits(~this.low, ~this.high, this.unsigned);
  };
  /**
   * Returns count leading zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.countLeadingZeros = function countLeadingZeros() {
    return this.high ? Math.clz32(this.high) : Math.clz32(this.low) + 32;
  };
  /**
   * Returns count leading zeros. This is an alias of {@link Long#countLeadingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.clz = LongPrototype.countLeadingZeros;
  /**
   * Returns count trailing zeros of this Long.
   * @this {!Long}
   * @returns {!number}
   */
  
  LongPrototype.countTrailingZeros = function countTrailingZeros() {
    return this.low ? ctz32(this.low) : ctz32(this.high) + 32;
  };
  /**
   * Returns count trailing zeros. This is an alias of {@link Long#countTrailingZeros}.
   * @function
   * @param {!Long}
   * @returns {!number}
   */
  
  
  LongPrototype.ctz = LongPrototype.countTrailingZeros;
  /**
   * Returns the bitwise AND of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  LongPrototype.and = function and(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low & other.low, this.high & other.high, this.unsigned);
  };
  /**
   * Returns the bitwise OR of this Long and the specified.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.or = function or(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low | other.low, this.high | other.high, this.unsigned);
  };
  /**
   * Returns the bitwise XOR of this Long and the given one.
   * @this {!Long}
   * @param {!Long|number|string} other Other Long
   * @returns {!Long}
   */
  
  
  LongPrototype.xor = function xor(other) {
    if (!isLong(other)) other = fromValue(other);
    return fromBits(this.low ^ other.low, this.high ^ other.high, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shiftLeft = function shiftLeft(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low << numBits, this.high << numBits | this.low >>> 32 - numBits, this.unsigned);else return fromBits(0, this.low << numBits - 32, this.unsigned);
  };
  /**
   * Returns this Long with bits shifted to the left by the given amount. This is an alias of {@link Long#shiftLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shl = LongPrototype.shiftLeft;
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRight = function shiftRight(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;else if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >> numBits, this.unsigned);else return fromBits(this.high >> numBits - 32, this.high >= 0 ? 0 : -1, this.unsigned);
  };
  /**
   * Returns this Long with bits arithmetically shifted to the right by the given amount. This is an alias of {@link Long#shiftRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shr = LongPrototype.shiftRight;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shiftRightUnsigned = function shiftRightUnsigned(numBits) {
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits < 32) return fromBits(this.low >>> numBits | this.high << 32 - numBits, this.high >>> numBits, this.unsigned);
    if (numBits === 32) return fromBits(this.high, 0, this.unsigned);
    return fromBits(this.high >>> numBits - 32, 0, this.unsigned);
  };
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  
  LongPrototype.shru = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits logically shifted to the right by the given amount. This is an alias of {@link Long#shiftRightUnsigned}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Shifted Long
   */
  
  LongPrototype.shr_u = LongPrototype.shiftRightUnsigned;
  /**
   * Returns this Long with bits rotated to the left by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateLeft = function rotateLeft(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.low << numBits | this.high >>> b, this.high << numBits | this.low >>> b, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.high << numBits | this.low >>> b, this.low << numBits | this.high >>> b, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the left by the given amount. This is an alias of {@link Long#rotateLeft}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotl = LongPrototype.rotateLeft;
  /**
   * Returns this Long with bits rotated to the right by the given amount.
   * @this {!Long}
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  LongPrototype.rotateRight = function rotateRight(numBits) {
    var b;
    if (isLong(numBits)) numBits = numBits.toInt();
    if ((numBits &= 63) === 0) return this;
    if (numBits === 32) return fromBits(this.high, this.low, this.unsigned);
  
    if (numBits < 32) {
      b = 32 - numBits;
      return fromBits(this.high << b | this.low >>> numBits, this.low << b | this.high >>> numBits, this.unsigned);
    }
  
    numBits -= 32;
    b = 32 - numBits;
    return fromBits(this.low << b | this.high >>> numBits, this.high << b | this.low >>> numBits, this.unsigned);
  };
  /**
   * Returns this Long with bits rotated to the right by the given amount. This is an alias of {@link Long#rotateRight}.
   * @function
   * @param {number|!Long} numBits Number of bits
   * @returns {!Long} Rotated Long
   */
  
  
  LongPrototype.rotr = LongPrototype.rotateRight;
  /**
   * Converts this Long to signed.
   * @this {!Long}
   * @returns {!Long} Signed long
   */
  
  LongPrototype.toSigned = function toSigned() {
    if (!this.unsigned) return this;
    return fromBits(this.low, this.high, false);
  };
  /**
   * Converts this Long to unsigned.
   * @this {!Long}
   * @returns {!Long} Unsigned long
   */
  
  
  LongPrototype.toUnsigned = function toUnsigned() {
    if (this.unsigned) return this;
    return fromBits(this.low, this.high, true);
  };
  /**
   * Converts this Long to its byte representation.
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @this {!Long}
   * @returns {!Array.<number>} Byte representation
   */
  
  
  LongPrototype.toBytes = function toBytes(le) {
    return le ? this.toBytesLE() : this.toBytesBE();
  };
  /**
   * Converts this Long to its little endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Little endian byte representation
   */
  
  
  LongPrototype.toBytesLE = function toBytesLE() {
    var hi = this.high,
        lo = this.low;
    return [lo & 0xff, lo >>> 8 & 0xff, lo >>> 16 & 0xff, lo >>> 24, hi & 0xff, hi >>> 8 & 0xff, hi >>> 16 & 0xff, hi >>> 24];
  };
  /**
   * Converts this Long to its big endian byte representation.
   * @this {!Long}
   * @returns {!Array.<number>} Big endian byte representation
   */
  
  
  LongPrototype.toBytesBE = function toBytesBE() {
    var hi = this.high,
        lo = this.low;
    return [hi >>> 24, hi >>> 16 & 0xff, hi >>> 8 & 0xff, hi & 0xff, lo >>> 24, lo >>> 16 & 0xff, lo >>> 8 & 0xff, lo & 0xff];
  };
  /**
   * Creates a Long from its byte representation.
   * @param {!Array.<number>} bytes Byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @param {boolean=} le Whether little or big endian, defaults to big endian
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytes = function fromBytes(bytes, unsigned, le) {
    return le ? Long.fromBytesLE(bytes, unsigned) : Long.fromBytesBE(bytes, unsigned);
  };
  /**
   * Creates a Long from its little endian byte representation.
   * @param {!Array.<number>} bytes Little endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesLE = function fromBytesLE(bytes, unsigned) {
    return new Long(bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24, bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24, unsigned);
  };
  /**
   * Creates a Long from its big endian byte representation.
   * @param {!Array.<number>} bytes Big endian byte representation
   * @param {boolean=} unsigned Whether unsigned or not, defaults to signed
   * @returns {Long} The corresponding Long value
   */
  
  
  Long.fromBytesBE = function fromBytesBE(bytes, unsigned) {
    return new Long(bytes[4] << 24 | bytes[5] << 16 | bytes[6] << 8 | bytes[7], bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3], unsigned);
  };
  
  var _default = Long;
  exports.default = _default;
  return "default" in exports ? exports.default : exports;
})({});
if (true) !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function() { return Long; }).apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
else {}


/***/ }),

/***/ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/package.json":
/*!**********************************************************************************************************!*\
  !*** ../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/package.json ***!
  \**********************************************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = /*#__PURE__*/JSON.parse('{"name":"@temporalio/workflow","version":"1.9.3","description":"Temporal.io SDK Workflow sub-package","keywords":["temporal","workflow","isolate"],"bugs":{"url":"https://github.com/temporalio/sdk-typescript/issues"},"repository":{"type":"git","url":"git+https://github.com/temporalio/sdk-typescript.git","directory":"packages/workflow"},"homepage":"https://github.com/temporalio/sdk-typescript/tree/main/packages/workflow","license":"MIT","author":"Temporal Technologies Inc. <sdk@temporal.io>","main":"lib/index.js","types":"lib/index.d.ts","scripts":{},"dependencies":{"@temporalio/common":"1.9.3","@temporalio/proto":"1.9.3"},"devDependencies":{"source-map":"^0.7.4"},"publishConfig":{"access":"public"},"files":["src","lib"],"gitHead":"e7e46639c1ba23b86f367a051fb54d736c5f21ce"}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = globalThis.__webpack_module_cache__;
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!****************************************************!*\
  !*** ./src/workflows-autogenerated-entrypoint.cjs ***!
  \****************************************************/

const api = __webpack_require__(/*! @temporalio/workflow/lib/worker-interface.js */ "../../node_modules/.pnpm/@temporalio+workflow@1.9.3/node_modules/@temporalio/workflow/lib/worker-interface.js");

api.overrideGlobals();

exports.api = api;

exports.importWorkflows = function importWorkflows() {
  return __webpack_require__(/* webpackMode: "eager" */ /*! ./src/workflows.ts */ "./src/workflows.ts");
}

exports.importInterceptors = function importInterceptors() {
  return [
    
  ];
}

})();

__TEMPORAL__ = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2Zsb3ctYnVuZGxlLWIyNWNkMjY3OGQwMzhjNDI3ZTE4LmpzIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBRUEsMEtBQThDO0FBSTlDLDBFQUEwRTtBQUMxRSxpRUFBaUU7QUFDakUsSUFBWSx3QkFJWDtBQUpELFdBQVksd0JBQXdCO0lBQ2xDLG1GQUFjO0lBQ2QscUhBQStCO0lBQy9CLDZFQUFXO0FBQ2IsQ0FBQyxFQUpXLHdCQUF3Qix3Q0FBeEIsd0JBQXdCLFFBSW5DO0FBRUQsK0JBQVksR0FBZ0YsQ0FBQztBQUM3RiwrQkFBWSxHQUFnRixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNmN0YsbU1BQWdGO0FBRWhGLG1NQUFnRjtBQTREaEY7Ozs7R0FJRztBQUNVLCtCQUF1QixHQUFxQixJQUFJLDJDQUF1QixFQUFFLENBQUM7QUFFdkY7O0dBRUc7QUFDVSw0QkFBb0IsR0FBd0I7SUFDdkQsZ0JBQWdCLEVBQUUsMkNBQXVCO0lBQ3pDLGdCQUFnQixFQUFFLCtCQUF1QjtJQUN6QyxhQUFhLEVBQUUsRUFBRTtDQUNsQixDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1RUYsNEpBYW9CO0FBQ3BCLDJLQUEwQztBQUMxQyxtTUFBMkc7QUFFM0csU0FBUyxhQUFhLENBQUMsR0FBRyxPQUFpQjtJQUN6QyxPQUFPLElBQUksTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckUsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxxQkFBcUIsR0FBRyxhQUFhO0FBQ3pDLHlCQUF5QjtBQUN6Qix1RkFBdUY7QUFDdkYsMEJBQTBCO0FBQzFCLGtHQUFrRztBQUNsRyx1Q0FBdUM7QUFDdkMsMkRBQTJELENBQzVELENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLDZCQUE2QixHQUFHLGFBQWE7QUFDakQsZ0VBQWdF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QUFxRjs7Ozs7Ozs7Ozs7Ozs7Ozs7O1VDdjVDMUY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLGlDQUFpQyxXQUFXO1dBQzVDO1dBQ0E7Ozs7O1dDUEE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7OztBQ0xBLFlBQVksbUJBQU8sQ0FBQyxtS0FBOEM7O0FBRWxFOztBQUVBLFdBQVc7O0FBRVgsdUJBQXVCO0FBQ3ZCLFNBQVMsbUJBQU8sNEJBQTRCLDhDQUF1RTtBQUNuSDs7QUFFQSwwQkFBMEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvYWN0aXZpdHktb3B0aW9ucy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvY29udmVydGVyL2RhdGEtY29udmVydGVyLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvZmFpbHVyZS1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rY29tbW9uQDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9jb252ZXJ0ZXIvcGF5bG9hZC1jb252ZXJ0ZXIudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rY29tbW9uQDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL2NvbnZlcnRlci90eXBlcy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZGVwcmVjYXRlZC10aW1lLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9lbmNvZGluZy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvZXJyb3JzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9mYWlsdXJlLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbmRleC50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvaW50ZXJjZXB0b3JzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy9sb2dnZXIudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rY29tbW9uQDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby9jb21tb24vc3JjL3JldHJ5LXBvbGljeS50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdGltZS50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvdHlwZS1oZWxwZXJzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC1lbnVtLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy92ZXJzaW9uaW5nLWludGVudC50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbytjb21tb25AMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL2NvbW1vbi9zcmMvd29ya2Zsb3ctaGFuZGxlLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK2NvbW1vbkAxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vY29tbW9uL3NyYy93b3JrZmxvdy1vcHRpb25zLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK3dvcmtmbG93QDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvYWxlYS50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2NhbmNlbGxhdGlvbi1zY29wZS50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2Vycm9ycy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL2dsb2JhbC1hdHRyaWJ1dGVzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK3dvcmtmbG93QDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW5kZXgudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rd29ya2Zsb3dAMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmNlcHRvcnMudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rd29ya2Zsb3dAMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy9pbnRlcmZhY2VzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK3dvcmtmbG93QDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvaW50ZXJuYWxzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK3dvcmtmbG93QDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvbG9ncy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3BrZy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3NpbmtzLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK3dvcmtmbG93QDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvc3RhY2staGVscGVycy50cyIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvc3JjL3RyaWdnZXIudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rd29ya2Zsb3dAMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L3NyYy93b3JrZXItaW50ZXJmYWNlLnRzIiwiL1VzZXJzL2pvaG5qb2huc29uL2Rldi9nbGlkZXItbW9ub3JlcG8vbm9kZV9tb2R1bGVzLy5wbnBtL0B0ZW1wb3JhbGlvK3dvcmtmbG93QDEuOS4zL25vZGVfbW9kdWxlcy9AdGVtcG9yYWxpby93b3JrZmxvdy9zcmMvd29ya2Zsb3cudHMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9hcHBzL3RlbXBvcmFsL3NyYy93b3JrZmxvd3MudHMiLCJpZ25vcmVkfC9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9AdGVtcG9yYWxpbyt3b3JrZmxvd0AxLjkuMy9ub2RlX21vZHVsZXMvQHRlbXBvcmFsaW8vd29ya2Zsb3cvbGlifF9fdGVtcG9yYWxfY3VzdG9tX2ZhaWx1cmVfY29udmVydGVyIiwiaWdub3JlZHwvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vQHRlbXBvcmFsaW8rd29ya2Zsb3dAMS45LjMvbm9kZV9tb2R1bGVzL0B0ZW1wb3JhbGlvL3dvcmtmbG93L2xpYnxfX3RlbXBvcmFsX2N1c3RvbV9wYXlsb2FkX2NvbnZlcnRlciIsIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL25vZGVfbW9kdWxlcy8ucG5wbS9tc0AzLjAuMC1jYW5hcnkuMS9ub2RlX21vZHVsZXMvbXMvZGlzdC9pbmRleC5janMiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9ub2RlX21vZHVsZXMvLnBucG0vbG9uZ0A1LjIuMy9ub2RlX21vZHVsZXMvbG9uZy91bWQvaW5kZXguanMiLCJ3ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCIvVXNlcnMvam9obmpvaG5zb24vZGV2L2dsaWRlci1tb25vcmVwby9hcHBzL3RlbXBvcmFsL3NyYy93b3JrZmxvd3MtYXV0b2dlbmVyYXRlZC1lbnRyeXBvaW50LmNqcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IFZlcnNpb25pbmdJbnRlbnQgfSBmcm9tICcuL3ZlcnNpb25pbmctaW50ZW50JztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlXG5leHBvcnQgZW51bSBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUge1xuICBUUllfQ0FOQ0VMID0gMCxcbiAgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEID0gMSxcbiAgQUJBTkRPTiA9IDIsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSwgQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlPigpO1xuY2hlY2tFeHRlbmRzPEFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZSwgY29yZXNkay53b3JrZmxvd19jb21tYW5kcy5BY3Rpdml0eUNhbmNlbGxhdGlvblR5cGU+KCk7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgcmVtb3RlIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3Rpdml0eU9wdGlvbnMge1xuICAvKipcbiAgICogSWRlbnRpZmllciB0byB1c2UgZm9yIHRyYWNraW5nIHRoZSBhY3Rpdml0eSBpbiBXb3JrZmxvdyBoaXN0b3J5LlxuICAgKiBUaGUgYGFjdGl2aXR5SWRgIGNhbiBiZSBhY2Nlc3NlZCBieSB0aGUgYWN0aXZpdHkgZnVuY3Rpb24uXG4gICAqIERvZXMgbm90IG5lZWQgdG8gYmUgdW5pcXVlLlxuICAgKlxuICAgKiBAZGVmYXVsdCBhbiBpbmNyZW1lbnRhbCBzZXF1ZW5jZSBudW1iZXJcbiAgICovXG4gIGFjdGl2aXR5SWQ/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgbmFtZS5cbiAgICpcbiAgICogQGRlZmF1bHQgY3VycmVudCB3b3JrZXIgdGFzayBxdWV1ZVxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBIZWFydGJlYXQgaW50ZXJ2YWwuIEFjdGl2aXR5IG11c3QgaGVhcnRiZWF0IGJlZm9yZSB0aGlzIGludGVydmFsIHBhc3NlcyBhZnRlciBhIGxhc3QgaGVhcnRiZWF0IG9yIGFjdGl2aXR5IHN0YXJ0LlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIGhlYXJ0YmVhdFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogUmV0cnlQb2xpY3kgdGhhdCBkZWZpbmUgaG93IGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIHNlcnZlci1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC4gVG8gZW5zdXJlIHplcm8gcmV0cmllcywgc2V0IG1heGltdW0gYXR0ZW1wdHMgdG8gMS5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSBvZiBhIHNpbmdsZSBBY3Rpdml0eSBleGVjdXRpb24gYXR0ZW1wdC4gTm90ZSB0aGF0IHRoZSBUZW1wb3JhbCBTZXJ2ZXIgZG9lc24ndCBkZXRlY3QgV29ya2VyIHByb2Nlc3NcbiAgICogZmFpbHVyZXMgZGlyZWN0bHkuIEl0IHJlbGllcyBvbiB0aGlzIHRpbWVvdXQgdG8gZGV0ZWN0IHRoYXQgYW4gQWN0aXZpdHkgdGhhdCBkaWRuJ3QgY29tcGxldGUgb24gdGltZS4gU28gdGhpc1xuICAgKiB0aW1lb3V0IHNob3VsZCBiZSBhcyBzaG9ydCBhcyB0aGUgbG9uZ2VzdCBwb3NzaWJsZSBleGVjdXRpb24gb2YgdGhlIEFjdGl2aXR5IGJvZHkuIFBvdGVudGlhbGx5IGxvbmcgcnVubmluZ1xuICAgKiBBY3Rpdml0aWVzIG11c3Qgc3BlY2lmeSB7QGxpbmsgaGVhcnRiZWF0VGltZW91dH0gYW5kIGNhbGwge0BsaW5rIGFjdGl2aXR5LkNvbnRleHQuaGVhcnRiZWF0fSBwZXJpb2RpY2FsbHkgZm9yXG4gICAqIHRpbWVseSBmYWlsdXJlIGRldGVjdGlvbi5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHN0YXJ0VG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogVGltZSB0aGF0IHRoZSBBY3Rpdml0eSBUYXNrIGNhbiBzdGF5IGluIHRoZSBUYXNrIFF1ZXVlIGJlZm9yZSBpdCBpcyBwaWNrZWQgdXAgYnkgYSBXb3JrZXIuIERvIG5vdCBzcGVjaWZ5IHRoaXMgdGltZW91dCB1bmxlc3MgdXNpbmcgaG9zdCBzcGVjaWZpYyBUYXNrIFF1ZXVlcyBmb3IgQWN0aXZpdHkgVGFza3MgYXJlIGJlaW5nIHVzZWQgZm9yIHJvdXRpbmcuXG4gICAqIGBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0YCBpcyBhbHdheXMgbm9uLXJldHJ5YWJsZS4gUmV0cnlpbmcgYWZ0ZXIgdGhpcyB0aW1lb3V0IGRvZXNuJ3QgbWFrZSBzZW5zZSBhcyBpdCB3b3VsZCBqdXN0IHB1dCB0aGUgQWN0aXZpdHkgVGFzayBiYWNrIGludG8gdGhlIHNhbWUgVGFzayBRdWV1ZS5cbiAgICpcbiAgICogQGRlZmF1bHQgYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIG9yIHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9TdGFydFRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogVG90YWwgdGltZSB0aGF0IGEgd29ya2Zsb3cgaXMgd2lsbGluZyB0byB3YWl0IGZvciBBY3Rpdml0eSB0byBjb21wbGV0ZS5cbiAgICogYHNjaGVkdWxlVG9DbG9zZVRpbWVvdXRgIGxpbWl0cyB0aGUgdG90YWwgdGltZSBvZiBhbiBBY3Rpdml0eSdzIGV4ZWN1dGlvbiBpbmNsdWRpbmcgcmV0cmllcyAodXNlIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSB0byBsaW1pdCB0aGUgdGltZSBvZiBhIHNpbmdsZSBhdHRlbXB0KS5cbiAgICpcbiAgICogRWl0aGVyIHRoaXMgb3B0aW9uIG9yIHtAbGluayBzdGFydFRvQ2xvc2VUaW1lb3V0fSBpcyByZXF1aXJlZC5cbiAgICpcbiAgICogQGRlZmF1bHQgdW5saW1pdGVkXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIHdoYXQgdGhlIFNESyBkb2VzIHdoZW4gdGhlIEFjdGl2aXR5IGlzIGNhbmNlbGxlZC5cbiAgICogLSBgVFJZX0NBTkNFTGAgLSBJbml0aWF0ZSBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICogLSBgV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVEYCAtIFdhaXQgZm9yIGFjdGl2aXR5IGNhbmNlbGxhdGlvbiBjb21wbGV0aW9uLiBOb3RlIHRoYXQgYWN0aXZpdHkgbXVzdCBoZWFydGJlYXQgdG8gcmVjZWl2ZSBhXG4gICAqICAgY2FuY2VsbGF0aW9uIG5vdGlmaWNhdGlvbi4gVGhpcyBjYW4gYmxvY2sgdGhlIGNhbmNlbGxhdGlvbiBmb3IgYSBsb25nIHRpbWUgaWYgYWN0aXZpdHkgZG9lc24ndFxuICAgKiAgIGhlYXJ0YmVhdCBvciBjaG9vc2VzIHRvIGlnbm9yZSB0aGUgY2FuY2VsbGF0aW9uIHJlcXVlc3QuXG4gICAqIC0gYEFCQU5ET05gIC0gRG8gbm90IHJlcXVlc3QgY2FuY2VsbGF0aW9uIG9mIHRoZSBhY3Rpdml0eSBhbmQgaW1tZWRpYXRlbHkgcmVwb3J0IGNhbmNlbGxhdGlvbiB0byB0aGUgd29ya2Zsb3cuXG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogQWN0aXZpdHlDYW5jZWxsYXRpb25UeXBlO1xuXG4gIC8qKlxuICAgKiBFYWdlciBkaXNwYXRjaCBpcyBhbiBvcHRpbWl6YXRpb24gdGhhdCBpbXByb3ZlcyB0aGUgdGhyb3VnaHB1dCBhbmQgbG9hZCBvbiB0aGUgc2VydmVyIGZvciBzY2hlZHVsaW5nIEFjdGl2aXRpZXMuXG4gICAqIFdoZW4gdXNlZCwgdGhlIHNlcnZlciB3aWxsIGhhbmQgb3V0IEFjdGl2aXR5IHRhc2tzIGJhY2sgdG8gdGhlIFdvcmtlciB3aGVuIGl0IGNvbXBsZXRlcyBhIFdvcmtmbG93IHRhc2suXG4gICAqIEl0IGlzIGF2YWlsYWJsZSBmcm9tIHNlcnZlciB2ZXJzaW9uIDEuMTcgYmVoaW5kIHRoZSBgc3lzdGVtLmVuYWJsZUFjdGl2aXR5RWFnZXJFeGVjdXRpb25gIGZlYXR1cmUgZmxhZy5cbiAgICpcbiAgICogRWFnZXIgZGlzcGF0Y2ggd2lsbCBvbmx5IGJlIHVzZWQgaWYgYGFsbG93RWFnZXJEaXNwYXRjaGAgaXMgZW5hYmxlZCAodGhlIGRlZmF1bHQpIGFuZCB7QGxpbmsgdGFza1F1ZXVlfSBpcyBlaXRoZXJcbiAgICogb21pdHRlZCBvciB0aGUgc2FtZSBhcyB0aGUgY3VycmVudCBXb3JrZmxvdy5cbiAgICpcbiAgICogQGRlZmF1bHQgdHJ1ZVxuICAgKi9cbiAgYWxsb3dFYWdlckRpc3BhdGNoPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogV2hlbiB1c2luZyB0aGUgV29ya2VyIFZlcnNpb25pbmcgZmVhdHVyZSwgc3BlY2lmaWVzIHdoZXRoZXIgdGhpcyBBY3Rpdml0eSBzaG91bGQgcnVuIG9uIGFcbiAgICogd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG4vKipcbiAqIE9wdGlvbnMgZm9yIGxvY2FsIGFjdGl2aXR5IGludm9jYXRpb25cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBSZXRyeVBvbGljeSB0aGF0IGRlZmluZXMgaG93IGFuIGFjdGl2aXR5IGlzIHJldHJpZWQgaW4gY2FzZSBvZiBmYWlsdXJlLiBJZiB0aGlzIGlzIG5vdCBzZXQsIHRoZW4gdGhlIFNESy1kZWZpbmVkIGRlZmF1bHQgYWN0aXZpdHkgcmV0cnkgcG9saWN5IHdpbGwgYmUgdXNlZC5cbiAgICogTm90ZSB0aGF0IGxvY2FsIGFjdGl2aXRpZXMgYXJlIGFsd2F5cyBleGVjdXRlZCBhdCBsZWFzdCBvbmNlLCBldmVuIGlmIG1heGltdW0gYXR0ZW1wdHMgaXMgc2V0IHRvIDEgZHVlIHRvIFdvcmtmbG93IHRhc2sgcmV0cmllcy5cbiAgICovXG4gIHJldHJ5PzogUmV0cnlQb2xpY3k7XG5cbiAgLyoqXG4gICAqIE1heGltdW0gdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgaXMgYWxsb3dlZCB0byBleGVjdXRlIGFmdGVyIHRoZSB0YXNrIGlzIGRpc3BhdGNoZWQuIFRoaXNcbiAgICogdGltZW91dCBpcyBhbHdheXMgcmV0cnlhYmxlLlxuICAgKlxuICAgKiBFaXRoZXIgdGhpcyBvcHRpb24gb3Ige0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IGlzIHJlcXVpcmVkLlxuICAgKiBJZiBzZXQsIHRoaXMgbXVzdCBiZSA8PSB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0sIG90aGVyd2lzZSwgaXQgd2lsbCBiZSBjbGFtcGVkIGRvd24uXG4gICAqXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgc3RhcnRUb0Nsb3NlVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaW1pdHMgdGltZSB0aGUgbG9jYWwgYWN0aXZpdHkgY2FuIGlkbGUgaW50ZXJuYWxseSBiZWZvcmUgYmVpbmcgZXhlY3V0ZWQuIFRoYXQgY2FuIGhhcHBlbiBpZlxuICAgKiB0aGUgd29ya2VyIGlzIGN1cnJlbnRseSBhdCBtYXggY29uY3VycmVudCBsb2NhbCBhY3Rpdml0eSBleGVjdXRpb25zLiBUaGlzIHRpbWVvdXQgaXMgYWx3YXlzXG4gICAqIG5vbiByZXRyeWFibGUgYXMgYWxsIGEgcmV0cnkgd291bGQgYWNoaWV2ZSBpcyB0byBwdXQgaXQgYmFjayBpbnRvIHRoZSBzYW1lIHF1ZXVlLiBEZWZhdWx0c1xuICAgKiB0byB7QGxpbmsgc2NoZWR1bGVUb0Nsb3NlVGltZW91dH0gaWYgbm90IHNwZWNpZmllZCBhbmQgdGhhdCBpcyBzZXQuIE11c3QgYmUgPD1cbiAgICoge0BsaW5rIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXR9IHdoZW4gc2V0LCBvdGhlcndpc2UsIGl0IHdpbGwgYmUgY2xhbXBlZCBkb3duLlxuICAgKlxuICAgKiBAZGVmYXVsdCB1bmxpbWl0ZWRcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0PzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyBob3cgbG9uZyB0aGUgY2FsbGVyIGlzIHdpbGxpbmcgdG8gd2FpdCBmb3IgbG9jYWwgYWN0aXZpdHkgY29tcGxldGlvbi4gTGltaXRzIGhvd1xuICAgKiBsb25nIHJldHJpZXMgd2lsbCBiZSBhdHRlbXB0ZWQuXG4gICAqXG4gICAqIEVpdGhlciB0aGlzIG9wdGlvbiBvciB7QGxpbmsgc3RhcnRUb0Nsb3NlVGltZW91dH0gaXMgcmVxdWlyZWQuXG4gICAqXG4gICAqIEBkZWZhdWx0IHVubGltaXRlZFxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHNjaGVkdWxlVG9DbG9zZVRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICogSWYgdGhlIGFjdGl2aXR5IGlzIHJldHJ5aW5nIGFuZCBiYWNrb2ZmIHdvdWxkIGV4Y2VlZCB0aGlzIHZhbHVlLCBhIHNlcnZlciBzaWRlIHRpbWVyIHdpbGwgYmUgc2NoZWR1bGVkIGZvciB0aGUgbmV4dCBhdHRlbXB0LlxuICAgKiBPdGhlcndpc2UsIGJhY2tvZmYgd2lsbCBoYXBwZW4gaW50ZXJuYWxseSBpbiB0aGUgU0RLLlxuICAgKlxuICAgKiBAZGVmYXVsdCAxIG1pbnV0ZVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICoqL1xuICBsb2NhbFJldHJ5VGhyZXNob2xkPzogRHVyYXRpb247XG5cbiAgLyoqXG4gICAqIERldGVybWluZXMgd2hhdCB0aGUgU0RLIGRvZXMgd2hlbiB0aGUgQWN0aXZpdHkgaXMgY2FuY2VsbGVkLlxuICAgKiAtIGBUUllfQ0FOQ0VMYCAtIEluaXRpYXRlIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgYW5kIGltbWVkaWF0ZWx5IHJlcG9ydCBjYW5jZWxsYXRpb24gdG8gdGhlIHdvcmtmbG93LlxuICAgKiAtIGBXQUlUX0NBTkNFTExBVElPTl9DT01QTEVURURgIC0gV2FpdCBmb3IgYWN0aXZpdHkgY2FuY2VsbGF0aW9uIGNvbXBsZXRpb24uIE5vdGUgdGhhdCBhY3Rpdml0eSBtdXN0IGhlYXJ0YmVhdCB0byByZWNlaXZlIGFcbiAgICogICBjYW5jZWxsYXRpb24gbm90aWZpY2F0aW9uLiBUaGlzIGNhbiBibG9jayB0aGUgY2FuY2VsbGF0aW9uIGZvciBhIGxvbmcgdGltZSBpZiBhY3Rpdml0eSBkb2Vzbid0XG4gICAqICAgaGVhcnRiZWF0IG9yIGNob29zZXMgdG8gaWdub3JlIHRoZSBjYW5jZWxsYXRpb24gcmVxdWVzdC5cbiAgICogLSBgQUJBTkRPTmAgLSBEbyBub3QgcmVxdWVzdCBjYW5jZWxsYXRpb24gb2YgdGhlIGFjdGl2aXR5IGFuZCBpbW1lZGlhdGVseSByZXBvcnQgY2FuY2VsbGF0aW9uIHRvIHRoZSB3b3JrZmxvdy5cbiAgICovXG4gIGNhbmNlbGxhdGlvblR5cGU/OiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLkFjdGl2aXR5Q2FuY2VsbGF0aW9uVHlwZTtcbn1cbiIsImltcG9ydCB7IERlZmF1bHRGYWlsdXJlQ29udmVydGVyLCBGYWlsdXJlQ29udmVydGVyIH0gZnJvbSAnLi9mYWlsdXJlLWNvbnZlcnRlcic7XG5pbXBvcnQgeyBQYXlsb2FkQ29kZWMgfSBmcm9tICcuL3BheWxvYWQtY29kZWMnO1xuaW1wb3J0IHsgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIsIFBheWxvYWRDb252ZXJ0ZXIgfSBmcm9tICcuL3BheWxvYWQtY29udmVydGVyJztcblxuLyoqXG4gKiBXaGVuIHlvdXIgZGF0YSAoYXJndW1lbnRzIGFuZCByZXR1cm4gdmFsdWVzKSBpcyBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIsIGl0IGlzIGVuY29kZWQgaW5cbiAqIGJpbmFyeSBpbiBhIHtAbGluayBQYXlsb2FkfSBQcm90b2J1ZiBtZXNzYWdlLlxuICpcbiAqIFRoZSBkZWZhdWx0IGBEYXRhQ29udmVydGVyYCBzdXBwb3J0cyBgdW5kZWZpbmVkYCwgYFVpbnQ4QXJyYXlgLCBhbmQgSlNPTiBzZXJpYWxpemFibGVzIChzbyBpZlxuICoge0BsaW5rIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL0pTT04vc3RyaW5naWZ5I2Rlc2NyaXB0aW9uIHwgYEpTT04uc3RyaW5naWZ5KHlvdXJBcmdPclJldHZhbClgfVxuICogd29ya3MsIHRoZSBkZWZhdWx0IGRhdGEgY29udmVydGVyIHdpbGwgd29yaykuIFByb3RvYnVmcyBhcmUgc3VwcG9ydGVkIHZpYVxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RhdGEtY29udmVydGVycyNwcm90b2J1ZnMgfCB0aGlzIEFQSX0uXG4gKlxuICogVXNlIGEgY3VzdG9tIGBEYXRhQ29udmVydGVyYCB0byBjb250cm9sIHRoZSBjb250ZW50cyBvZiB5b3VyIHtAbGluayBQYXlsb2FkfXMuIENvbW1vbiByZWFzb25zIGZvciB1c2luZyBhIGN1c3RvbVxuICogYERhdGFDb252ZXJ0ZXJgIGFyZTpcbiAqIC0gQ29udmVydGluZyB2YWx1ZXMgdGhhdCBhcmUgbm90IHN1cHBvcnRlZCBieSB0aGUgZGVmYXVsdCBgRGF0YUNvbnZlcnRlcmAgKGZvciBleGFtcGxlLCBgSlNPTi5zdHJpbmdpZnkoKWAgZG9lc24ndFxuICogICBoYW5kbGUgYEJpZ0ludGBzLCBzbyBpZiB5b3Ugd2FudCB0byByZXR1cm4gYHsgdG90YWw6IDEwMDBuIH1gIGZyb20gYSBXb3JrZmxvdywgU2lnbmFsLCBvciBBY3Rpdml0eSwgeW91IG5lZWQgeW91clxuICogICBvd24gYERhdGFDb252ZXJ0ZXJgKS5cbiAqIC0gRW5jcnlwdGluZyB2YWx1ZXMgdGhhdCBtYXkgY29udGFpbiBwcml2YXRlIGluZm9ybWF0aW9uIHRoYXQgeW91IGRvbid0IHdhbnQgc3RvcmVkIGluIHBsYWludGV4dCBpbiBUZW1wb3JhbCBTZXJ2ZXInc1xuICogICBkYXRhYmFzZS5cbiAqIC0gQ29tcHJlc3NpbmcgdmFsdWVzIHRvIHJlZHVjZSBkaXNrIG9yIG5ldHdvcmsgdXNhZ2UuXG4gKlxuICogVG8gdXNlIHlvdXIgY3VzdG9tIGBEYXRhQ29udmVydGVyYCwgcHJvdmlkZSBpdCB0byB0aGUge0BsaW5rIFdvcmtmbG93Q2xpZW50fSwge0BsaW5rIFdvcmtlcn0sIGFuZFxuICoge0BsaW5rIGJ1bmRsZVdvcmtmbG93Q29kZX0gKGlmIHlvdSB1c2UgaXQpOlxuICogLSBgbmV3IFdvcmtmbG93Q2xpZW50KHsgLi4uLCBkYXRhQ29udmVydGVyIH0pYFxuICogLSBgV29ya2VyLmNyZWF0ZSh7IC4uLiwgZGF0YUNvbnZlcnRlciB9KWBcbiAqIC0gYGJ1bmRsZVdvcmtmbG93Q29kZSh7IC4uLiwgcGF5bG9hZENvbnZlcnRlclBhdGggfSlgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGF0YUNvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBwYXlsb2FkQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBwYXlsb2FkQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIHBheWxvYWRDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBQYXRoIG9mIGEgZmlsZSB0aGF0IGhhcyBhIGBmYWlsdXJlQ29udmVydGVyYCBuYW1lZCBleHBvcnQuXG4gICAqIGBmYWlsdXJlQ29udmVydGVyYCBzaG91bGQgYmUgYW4gb2JqZWN0IHRoYXQgaW1wbGVtZW50cyB7QGxpbmsgRmFpbHVyZUNvbnZlcnRlcn0uXG4gICAqIElmIG5vIHBhdGggaXMgcHJvdmlkZWQsIHtAbGluayBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gaXMgdXNlZC5cbiAgICovXG4gIGZhaWx1cmVDb252ZXJ0ZXJQYXRoPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBBbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZENvZGVjfSBpbnN0YW5jZXMuXG4gICAqXG4gICAqIFBheWxvYWRzIGFyZSBlbmNvZGVkIGluIHRoZSBvcmRlciBvZiB0aGUgYXJyYXkgYW5kIGRlY29kZWQgaW4gdGhlIG9wcG9zaXRlIG9yZGVyLiBGb3IgZXhhbXBsZSwgaWYgeW91IGhhdmUgYVxuICAgKiBjb21wcmVzc2lvbiBjb2RlYyBhbmQgYW4gZW5jcnlwdGlvbiBjb2RlYywgdGhlbiB5b3Ugd2FudCBkYXRhIHRvIGJlIGVuY29kZWQgd2l0aCB0aGUgY29tcHJlc3Npb24gY29kZWMgZmlyc3QsIHNvXG4gICAqIHlvdSdkIGRvIGBwYXlsb2FkQ29kZWNzOiBbY29tcHJlc3Npb25Db2RlYywgZW5jcnlwdGlvbkNvZGVjXWAuXG4gICAqL1xuICBwYXlsb2FkQ29kZWNzPzogUGF5bG9hZENvZGVjW107XG59XG5cbi8qKlxuICogQSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0gdGhhdCBoYXMgYmVlbiBsb2FkZWQgdmlhIHtAbGluayBsb2FkRGF0YUNvbnZlcnRlcn0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9hZGVkRGF0YUNvbnZlcnRlciB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXI7XG4gIGZhaWx1cmVDb252ZXJ0ZXI6IEZhaWx1cmVDb252ZXJ0ZXI7XG4gIHBheWxvYWRDb2RlY3M6IFBheWxvYWRDb2RlY1tdO1xufVxuXG4vKipcbiAqIFRoZSBkZWZhdWx0IHtAbGluayBGYWlsdXJlQ29udmVydGVyfSB1c2VkIGJ5IHRoZSBTREsuXG4gKlxuICogRXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcmUgc2VyaXphbGl6ZWQgYXMgcGxhaW4gdGV4dC5cbiAqL1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyOiBGYWlsdXJlQ29udmVydGVyID0gbmV3IERlZmF1bHRGYWlsdXJlQ29udmVydGVyKCk7XG5cbi8qKlxuICogQSBcImxvYWRlZFwiIGRhdGEgY29udmVydGVyIHRoYXQgdXNlcyB0aGUgZGVmYXVsdCBzZXQgb2YgZmFpbHVyZSBhbmQgcGF5bG9hZCBjb252ZXJ0ZXJzLlxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdERhdGFDb252ZXJ0ZXI6IExvYWRlZERhdGFDb252ZXJ0ZXIgPSB7XG4gIHBheWxvYWRDb252ZXJ0ZXI6IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBmYWlsdXJlQ29udmVydGVyOiBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgcGF5bG9hZENvZGVjczogW10sXG59O1xuIiwiaW1wb3J0IHtcbiAgQWN0aXZpdHlGYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBGQUlMVVJFX1NPVVJDRSxcbiAgUHJvdG9GYWlsdXJlLFxuICBSZXRyeVN0YXRlLFxuICBTZXJ2ZXJGYWlsdXJlLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFRlcm1pbmF0ZWRGYWlsdXJlLFxuICBUaW1lb3V0RmFpbHVyZSxcbiAgVGltZW91dFR5cGUsXG59IGZyb20gJy4uL2ZhaWx1cmUnO1xuaW1wb3J0IHsgaXNFcnJvciB9IGZyb20gJy4uL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBhcnJheUZyb21QYXlsb2FkcywgZnJvbVBheWxvYWRzQXRJbmRleCwgUGF5bG9hZENvbnZlcnRlciwgdG9QYXlsb2FkcyB9IGZyb20gJy4vcGF5bG9hZC1jb252ZXJ0ZXInO1xuXG5mdW5jdGlvbiBjb21iaW5lUmVnRXhwKC4uLnJlZ2V4cHM6IFJlZ0V4cFtdKTogUmVnRXhwIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXhwcy5tYXAoKHgpID0+IGAoPzoke3guc291cmNlfSlgKS5qb2luKCd8JykpO1xufVxuXG4vKipcbiAqIFN0YWNrIHRyYWNlcyB3aWxsIGJlIGN1dG9mZiB3aGVuIG9uIG9mIHRoZXNlIHBhdHRlcm5zIGlzIG1hdGNoZWRcbiAqL1xuY29uc3QgQ1VUT0ZGX1NUQUNLX1BBVFRFUk5TID0gY29tYmluZVJlZ0V4cChcbiAgLyoqIEFjdGl2aXR5IGV4ZWN1dGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2aXR5XFwuZXhlY3V0ZSBcXCguKltcXFxcL113b3JrZXJbXFxcXC9dKD86c3JjfGxpYilbXFxcXC9dYWN0aXZpdHlcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgYWN0aXZhdGlvbiAqL1xuICAvXFxzK2F0IEFjdGl2YXRvclxcLlxcUytOZXh0SGFuZGxlciBcXCguKltcXFxcL113b3JrZmxvd1tcXFxcL10oPzpzcmN8bGliKVtcXFxcL11pbnRlcm5hbHNcXC5banRdczpcXGQrOlxcZCtcXCkvLFxuICAvKiogV29ya2Zsb3cgcnVuIGFueXRoaW5nIGluIGNvbnRleHQgKi9cbiAgL1xccythdCBTY3JpcHRcXC5ydW5JbkNvbnRleHQgXFwoKD86bm9kZTp2bXx2bVxcLmpzKTpcXGQrOlxcZCtcXCkvXG4pO1xuXG4vKipcbiAqIEFueSBzdGFjayB0cmFjZSBmcmFtZXMgdGhhdCBtYXRjaCBhbnkgb2YgdGhvc2Ugd2lsIGJlIGRvcHBlZC5cbiAqIFRoZSBcIm51bGwuXCIgcHJlZml4IG9uIHNvbWUgY2FzZXMgaXMgdG8gYXZvaWQgaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy80MjQxN1xuICovXG5jb25zdCBEUk9QUEVEX1NUQUNLX0ZSQU1FU19QQVRURVJOUyA9IGNvbWJpbmVSZWdFeHAoXG4gIC8qKiBJbnRlcm5hbCBmdW5jdGlvbnMgdXNlZCB0byByZWN1cnNpdmVseSBjaGFpbiBpbnRlcmNlcHRvcnMgKi9cbiAgL1xccythdCAobnVsbFxcLik/bmV4dCBcXCguKltcXFxcL11jb21tb25bXFxcXC9dKD86c3JjfGxpYilbXFxcXC9daW50ZXJjZXB0b3JzXFwuW2p0XXM6XFxkKzpcXGQrXFwpLyxcbiAgLyoqIEludGVybmFsIGZ1bmN0aW9ucyB1c2VkIHRvIHJlY3Vyc2l2ZWx5IGNoYWluIGludGVyY2VwdG9ycyAqL1xuICAvXFxzK2F0IChudWxsXFwuKT9leGVjdXRlTmV4dEhhbmRsZXIgXFwoLipbXFxcXC9dd29ya2VyW1xcXFwvXSg/OnNyY3xsaWIpW1xcXFwvXWFjdGl2aXR5XFwuW2p0XXM6XFxkKzpcXGQrXFwpL1xuKTtcblxuLyoqXG4gKiBDdXRzIG91dCB0aGUgZnJhbWV3b3JrIHBhcnQgb2YgYSBzdGFjayB0cmFjZSwgbGVhdmluZyBvbmx5IHVzZXIgY29kZSBlbnRyaWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjdXRvZmZTdGFja1RyYWNlKHN0YWNrPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgY29uc3QgbGluZXMgPSAoc3RhY2sgPz8gJycpLnNwbGl0KC9cXHI/XFxuLyk7XG4gIGNvbnN0IGFjYyA9IEFycmF5PHN0cmluZz4oKTtcbiAgZm9yIChjb25zdCBsaW5lIG9mIGxpbmVzKSB7XG4gICAgaWYgKENVVE9GRl9TVEFDS19QQVRURVJOUy50ZXN0KGxpbmUpKSBicmVhaztcbiAgICBpZiAoIURST1BQRURfU1RBQ0tfRlJBTUVTX1BBVFRFUk5TLnRlc3QobGluZSkpIGFjYy5wdXNoKGxpbmUpO1xuICB9XG4gIHJldHVybiBhY2Muam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogQSBgRmFpbHVyZUNvbnZlcnRlcmAgaXMgcmVzcG9uc2libGUgZm9yIGNvbnZlcnRpbmcgZnJvbSBwcm90byBgRmFpbHVyZWAgaW5zdGFuY2VzIHRvIEpTIGBFcnJvcnNgIGFuZCBiYWNrLlxuICpcbiAqIFdlIHJlY29tbWVuZGVkIHVzaW5nIHRoZSB7QGxpbmsgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJ9IGluc3RlYWQgb2YgY3VzdG9taXppbmcgdGhlIGRlZmF1bHQgaW1wbGVtZW50YXRpb24gaW4gb3JkZXJcbiAqIHRvIG1haW50YWluIGNyb3NzLWxhbmd1YWdlIEZhaWx1cmUgc2VyaWFsaXphdGlvbiBjb21wYXRpYmlsaXR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZhaWx1cmVDb252ZXJ0ZXIge1xuICAvKipcbiAgICogQ29udmVydHMgYSBjYXVnaHQgZXJyb3IgdG8gYSBGYWlsdXJlIHByb3RvIG1lc3NhZ2UuXG4gICAqL1xuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmU7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogVGhlIHJldHVybmVkIGVycm9yIG11c3QgYmUgYW4gaW5zdGFuY2Ugb2YgYFRlbXBvcmFsRmFpbHVyZWAuXG4gICAqL1xuICBmYWlsdXJlVG9FcnJvcihlcnI6IFByb3RvRmFpbHVyZSwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFRlbXBvcmFsRmFpbHVyZTtcbn1cblxuLyoqXG4gKiBUaGUgXCJzaGFwZVwiIG9mIHRoZSBhdHRyaWJ1dGVzIHNldCBhcyB0aGUge0BsaW5rIFByb3RvRmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlc30gcGF5bG9hZCBpbiBjYXNlXG4gKiB7QGxpbmsgRGVmYXVsdEVuY29kZWRGYWlsdXJlQXR0cmlidXRlcy5lbmNvZGVDb21tb25BdHRyaWJ1dGVzfSBpcyBzZXQgdG8gYHRydWVgLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXMge1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN0YWNrX3RyYWNlOiBzdHJpbmc7XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgdGhlIHtAbGluayBEZWZhdWx0RmFpbHVyZUNvbnZlcnRlcn0gY29uc3RydWN0b3IuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXJPcHRpb25zIHtcbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gZW5jb2RlIGVycm9yIG1lc3NhZ2VzIGFuZCBzdGFjayB0cmFjZXMgKGZvciBlbmNyeXB0aW5nIHRoZXNlIGF0dHJpYnV0ZXMgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30pLlxuICAgKi9cbiAgZW5jb2RlQ29tbW9uQXR0cmlidXRlczogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBEZWZhdWx0LCBjcm9zcy1sYW5ndWFnZS1jb21wYXRpYmxlIEZhaWx1cmUgY29udmVydGVyLlxuICpcbiAqIEJ5IGRlZmF1bHQsIGl0IHdpbGwgbGVhdmUgZXJyb3IgbWVzc2FnZXMgYW5kIHN0YWNrIHRyYWNlcyBhcyBwbGFpbiB0ZXh0LiBJbiBvcmRlciB0byBlbmNyeXB0IHRoZW0sIHNldFxuICogYGVuY29kZUNvbW1vbkF0dHJpYnV0ZXNgIHRvIGB0cnVlYCBpbiB0aGUgY29uc3RydWN0b3Igb3B0aW9ucyBhbmQgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30gdGhhdCBjYW4gZW5jcnlwdCAvXG4gKiBkZWNyeXB0IFBheWxvYWRzIGluIHlvdXIge0BsaW5rIFdvcmtlck9wdGlvbnMuZGF0YUNvbnZlcnRlciB8IFdvcmtlcn0gYW5kXG4gKiB7QGxpbmsgQ2xpZW50T3B0aW9ucy5kYXRhQ29udmVydGVyIHwgQ2xpZW50IG9wdGlvbnN9LlxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEZhaWx1cmVDb252ZXJ0ZXIgaW1wbGVtZW50cyBGYWlsdXJlQ29udmVydGVyIHtcbiAgcHVibGljIHJlYWRvbmx5IG9wdGlvbnM6IERlZmF1bHRGYWlsdXJlQ29udmVydGVyT3B0aW9ucztcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zPzogUGFydGlhbDxEZWZhdWx0RmFpbHVyZUNvbnZlcnRlck9wdGlvbnM+KSB7XG4gICAgY29uc3QgeyBlbmNvZGVDb21tb25BdHRyaWJ1dGVzIH0gPSBvcHRpb25zID8/IHt9O1xuICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgIGVuY29kZUNvbW1vbkF0dHJpYnV0ZXM6IGVuY29kZUNvbW1vbkF0dHJpYnV0ZXMgPz8gZmFsc2UsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIEZhaWx1cmUgcHJvdG8gbWVzc2FnZSB0byBhIEpTIEVycm9yIG9iamVjdC5cbiAgICpcbiAgICogRG9lcyBub3Qgc2V0IGNvbW1vbiBwcm9wZXJ0aWVzLCB0aGF0IGlzIGRvbmUgaW4ge0BsaW5rIGZhaWx1cmVUb0Vycm9yfS5cbiAgICovXG4gIGZhaWx1cmVUb0Vycm9ySW5uZXIoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvKSB7XG4gICAgICByZXR1cm4gbmV3IEFwcGxpY2F0aW9uRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLnR5cGUsXG4gICAgICAgIEJvb2xlYW4oZmFpbHVyZS5hcHBsaWNhdGlvbkZhaWx1cmVJbmZvLm5vblJldHJ5YWJsZSksXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUuYXBwbGljYXRpb25GYWlsdXJlSW5mby5kZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5zZXJ2ZXJGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBTZXJ2ZXJGYWlsdXJlKFxuICAgICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgICBCb29sZWFuKGZhaWx1cmUuc2VydmVyRmFpbHVyZUluZm8ubm9uUmV0cnlhYmxlKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBUaW1lb3V0RmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgZnJvbVBheWxvYWRzQXRJbmRleChwYXlsb2FkQ29udmVydGVyLCAwLCBmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mby5sYXN0SGVhcnRiZWF0RGV0YWlscz8ucGF5bG9hZHMpLFxuICAgICAgICBmYWlsdXJlLnRpbWVvdXRGYWlsdXJlSW5mby50aW1lb3V0VHlwZSA/PyBUaW1lb3V0VHlwZS5USU1FT1VUX1RZUEVfVU5TUEVDSUZJRURcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnRlcm1pbmF0ZWRGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBUZXJtaW5hdGVkRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLmNhbmNlbGVkRmFpbHVyZUluZm8pIHtcbiAgICAgIHJldHVybiBuZXcgQ2FuY2VsbGVkRmFpbHVyZShcbiAgICAgICAgZmFpbHVyZS5tZXNzYWdlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgYXJyYXlGcm9tUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgZmFpbHVyZS5jYW5jZWxlZEZhaWx1cmVJbmZvLmRldGFpbHM/LnBheWxvYWRzKSxcbiAgICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICAgICk7XG4gICAgfVxuICAgIGlmIChmYWlsdXJlLnJlc2V0V29ya2Zsb3dGYWlsdXJlSW5mbykge1xuICAgICAgcmV0dXJuIG5ldyBBcHBsaWNhdGlvbkZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgICdSZXNldFdvcmtmbG93JyxcbiAgICAgICAgZmFsc2UsXG4gICAgICAgIGFycmF5RnJvbVBheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIGZhaWx1cmUucmVzZXRXb3JrZmxvd0ZhaWx1cmVJbmZvLmxhc3RIZWFydGJlYXREZXRhaWxzPy5wYXlsb2FkcyksXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5jaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbHVyZUluZm8pIHtcbiAgICAgIGNvbnN0IHsgbmFtZXNwYWNlLCB3b3JrZmxvd1R5cGUsIHdvcmtmbG93RXhlY3V0aW9uLCByZXRyeVN0YXRlIH0gPSBmYWlsdXJlLmNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbztcbiAgICAgIGlmICghKHdvcmtmbG93VHlwZT8ubmFtZSAmJiB3b3JrZmxvd0V4ZWN1dGlvbikpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhdHRyaWJ1dGVzIG9uIGNoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsdXJlSW5mbycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBDaGlsZFdvcmtmbG93RmFpbHVyZShcbiAgICAgICAgbmFtZXNwYWNlID8/IHVuZGVmaW5lZCxcbiAgICAgICAgd29ya2Zsb3dFeGVjdXRpb24sXG4gICAgICAgIHdvcmtmbG93VHlwZS5uYW1lLFxuICAgICAgICByZXRyeVN0YXRlID8/IFJldHJ5U3RhdGUuUkVUUllfU1RBVEVfVU5TUEVDSUZJRUQsXG4gICAgICAgIHRoaXMub3B0aW9uYWxGYWlsdXJlVG9PcHRpb25hbEVycm9yKGZhaWx1cmUuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvKSB7XG4gICAgICBpZiAoIWZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eVR5cGU/Lm5hbWUpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3Rpdml0eVR5cGU/Lm5hbWUgb24gYWN0aXZpdHlGYWlsdXJlSW5mbycpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBBY3Rpdml0eUZhaWx1cmUoXG4gICAgICAgIGZhaWx1cmUubWVzc2FnZSA/PyB1bmRlZmluZWQsXG4gICAgICAgIGZhaWx1cmUuYWN0aXZpdHlGYWlsdXJlSW5mby5hY3Rpdml0eVR5cGUubmFtZSxcbiAgICAgICAgZmFpbHVyZS5hY3Rpdml0eUZhaWx1cmVJbmZvLmFjdGl2aXR5SWQgPz8gdW5kZWZpbmVkLFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8ucmV0cnlTdGF0ZSA/PyBSZXRyeVN0YXRlLlJFVFJZX1NUQVRFX1VOU1BFQ0lGSUVELFxuICAgICAgICBmYWlsdXJlLmFjdGl2aXR5RmFpbHVyZUluZm8uaWRlbnRpdHkgPz8gdW5kZWZpbmVkLFxuICAgICAgICB0aGlzLm9wdGlvbmFsRmFpbHVyZVRvT3B0aW9uYWxFcnJvcihmYWlsdXJlLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBUZW1wb3JhbEZhaWx1cmUoXG4gICAgICBmYWlsdXJlLm1lc3NhZ2UgPz8gdW5kZWZpbmVkLFxuICAgICAgdGhpcy5vcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoZmFpbHVyZS5jYXVzZSwgcGF5bG9hZENvbnZlcnRlcilcbiAgICApO1xuICB9XG5cbiAgZmFpbHVyZVRvRXJyb3IoZmFpbHVyZTogUHJvdG9GYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgICBpZiAoZmFpbHVyZS5lbmNvZGVkQXR0cmlidXRlcykge1xuICAgICAgY29uc3QgYXR0cnMgPSBwYXlsb2FkQ29udmVydGVyLmZyb21QYXlsb2FkPERlZmF1bHRFbmNvZGVkRmFpbHVyZUF0dHJpYnV0ZXM+KGZhaWx1cmUuZW5jb2RlZEF0dHJpYnV0ZXMpO1xuICAgICAgLy8gRG9uJ3QgYXBwbHkgZW5jb2RlZEF0dHJpYnV0ZXMgdW5sZXNzIHRoZXkgY29uZm9ybSB0byBhbiBleHBlY3RlZCBzY2hlbWFcbiAgICAgIGlmICh0eXBlb2YgYXR0cnMgPT09ICdvYmplY3QnICYmIGF0dHJzICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tfdHJhY2UgfSA9IGF0dHJzO1xuICAgICAgICAvLyBBdm9pZCBtdXRhdGluZyB0aGUgYXJndW1lbnRcbiAgICAgICAgZmFpbHVyZSA9IHsgLi4uZmFpbHVyZSB9O1xuICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgZmFpbHVyZS5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHN0YWNrX3RyYWNlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGZhaWx1cmUuc3RhY2tUcmFjZSA9IHN0YWNrX3RyYWNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IGVyciA9IHRoaXMuZmFpbHVyZVRvRXJyb3JJbm5lcihmYWlsdXJlLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBlcnIuc3RhY2sgPSBmYWlsdXJlLnN0YWNrVHJhY2UgPz8gJyc7XG4gICAgZXJyLmZhaWx1cmUgPSBmYWlsdXJlO1xuICAgIHJldHVybiBlcnI7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSB0aGlzLmVycm9yVG9GYWlsdXJlSW5uZXIoZXJyLCBwYXlsb2FkQ29udmVydGVyKTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmVuY29kZUNvbW1vbkF0dHJpYnV0ZXMpIHtcbiAgICAgIGNvbnN0IHsgbWVzc2FnZSwgc3RhY2tUcmFjZSB9ID0gZmFpbHVyZTtcbiAgICAgIGZhaWx1cmUubWVzc2FnZSA9ICdFbmNvZGVkIGZhaWx1cmUnO1xuICAgICAgZmFpbHVyZS5zdGFja1RyYWNlID0gJyc7XG4gICAgICBmYWlsdXJlLmVuY29kZWRBdHRyaWJ1dGVzID0gcGF5bG9hZENvbnZlcnRlci50b1BheWxvYWQoeyBtZXNzYWdlLCBzdGFja190cmFjZTogc3RhY2tUcmFjZSB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGZhaWx1cmU7XG4gIH1cblxuICBlcnJvclRvRmFpbHVyZUlubmVyKGVycjogdW5rbm93biwgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlcik6IFByb3RvRmFpbHVyZSB7XG4gICAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgICAgaWYgKGVyci5mYWlsdXJlKSByZXR1cm4gZXJyLmZhaWx1cmU7XG4gICAgICBjb25zdCBiYXNlID0ge1xuICAgICAgICBtZXNzYWdlOiBlcnIubWVzc2FnZSxcbiAgICAgICAgc3RhY2tUcmFjZTogY3V0b2ZmU3RhY2tUcmFjZShlcnIuc3RhY2spLFxuICAgICAgICBjYXVzZTogdGhpcy5vcHRpb25hbEVycm9yVG9PcHRpb25hbEZhaWx1cmUoZXJyLmNhdXNlLCBwYXlsb2FkQ29udmVydGVyKSxcbiAgICAgICAgc291cmNlOiBGQUlMVVJFX1NPVVJDRSxcbiAgICAgIH07XG5cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBY3Rpdml0eUZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFjdGl2aXR5RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIC4uLmVycixcbiAgICAgICAgICAgIGFjdGl2aXR5VHlwZTogeyBuYW1lOiBlcnIuYWN0aXZpdHlUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDaGlsZFdvcmtmbG93RmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgY2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICAuLi5lcnIsXG4gICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogZXJyLmV4ZWN1dGlvbixcbiAgICAgICAgICAgIHdvcmtmbG93VHlwZTogeyBuYW1lOiBlcnIud29ya2Zsb3dUeXBlIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5iYXNlLFxuICAgICAgICAgIGFwcGxpY2F0aW9uRmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHR5cGU6IGVyci50eXBlLFxuICAgICAgICAgICAgbm9uUmV0cnlhYmxlOiBlcnIubm9uUmV0cnlhYmxlLFxuICAgICAgICAgICAgZGV0YWlsczpcbiAgICAgICAgICAgICAgZXJyLmRldGFpbHMgJiYgZXJyLmRldGFpbHMubGVuZ3RoXG4gICAgICAgICAgICAgICAgPyB7IHBheWxvYWRzOiB0b1BheWxvYWRzKHBheWxvYWRDb252ZXJ0ZXIsIC4uLmVyci5kZXRhaWxzKSB9XG4gICAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBjYW5jZWxlZEZhaWx1cmVJbmZvOiB7XG4gICAgICAgICAgICBkZXRhaWxzOlxuICAgICAgICAgICAgICBlcnIuZGV0YWlscyAmJiBlcnIuZGV0YWlscy5sZW5ndGhcbiAgICAgICAgICAgICAgICA/IHsgcGF5bG9hZHM6IHRvUGF5bG9hZHMocGF5bG9hZENvbnZlcnRlciwgLi4uZXJyLmRldGFpbHMpIH1cbiAgICAgICAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFRpbWVvdXRGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICB0aW1lb3V0RmFpbHVyZUluZm86IHtcbiAgICAgICAgICAgIHRpbWVvdXRUeXBlOiBlcnIudGltZW91dFR5cGUsXG4gICAgICAgICAgICBsYXN0SGVhcnRiZWF0RGV0YWlsczogZXJyLmxhc3RIZWFydGJlYXREZXRhaWxzXG4gICAgICAgICAgICAgID8geyBwYXlsb2FkczogdG9QYXlsb2FkcyhwYXlsb2FkQ29udmVydGVyLCBlcnIubGFzdEhlYXJ0YmVhdERldGFpbHMpIH1cbiAgICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBTZXJ2ZXJGYWlsdXJlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uYmFzZSxcbiAgICAgICAgICBzZXJ2ZXJGYWlsdXJlSW5mbzogeyBub25SZXRyeWFibGU6IGVyci5ub25SZXRyeWFibGUgfSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmIChlcnIgaW5zdGFuY2VvZiBUZXJtaW5hdGVkRmFpbHVyZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIC4uLmJhc2UsXG4gICAgICAgICAgdGVybWluYXRlZEZhaWx1cmVJbmZvOiB7fSxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIC8vIEp1c3QgYSBUZW1wb3JhbEZhaWx1cmVcbiAgICAgIHJldHVybiBiYXNlO1xuICAgIH1cblxuICAgIGNvbnN0IGJhc2UgPSB7XG4gICAgICBzb3VyY2U6IEZBSUxVUkVfU09VUkNFLFxuICAgIH07XG5cbiAgICBpZiAoaXNFcnJvcihlcnIpKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5iYXNlLFxuICAgICAgICBtZXNzYWdlOiBTdHJpbmcoZXJyLm1lc3NhZ2UpID8/ICcnLFxuICAgICAgICBzdGFja1RyYWNlOiBjdXRvZmZTdGFja1RyYWNlKGVyci5zdGFjayksXG4gICAgICAgIGNhdXNlOiB0aGlzLm9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZSgoZXJyIGFzIGFueSkuY2F1c2UsIHBheWxvYWRDb252ZXJ0ZXIpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCByZWNvbW1lbmRhdGlvbiA9IGAgW0Egbm9uLUVycm9yIHZhbHVlIHdhcyB0aHJvd24gZnJvbSB5b3VyIGNvZGUuIFdlIHJlY29tbWVuZCB0aHJvd2luZyBFcnJvciBvYmplY3RzIHNvIHRoYXQgd2UgY2FuIHByb3ZpZGUgYSBzdGFjayB0cmFjZV1gO1xuXG4gICAgaWYgKHR5cGVvZiBlcnIgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4geyAuLi5iYXNlLCBtZXNzYWdlOiBlcnIgKyByZWNvbW1lbmRhdGlvbiB9O1xuICAgIH1cbiAgICBpZiAodHlwZW9mIGVyciA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGxldCBtZXNzYWdlID0gJyc7XG4gICAgICB0cnkge1xuICAgICAgICBtZXNzYWdlID0gSlNPTi5zdHJpbmdpZnkoZXJyKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgICAgbWVzc2FnZSA9IFN0cmluZyhlcnIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogbWVzc2FnZSArIHJlY29tbWVuZGF0aW9uIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgLi4uYmFzZSwgbWVzc2FnZTogU3RyaW5nKGVycikgKyByZWNvbW1lbmRhdGlvbiB9O1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIHRvIGEgSlMgRXJyb3Igb2JqZWN0IGlmIGRlZmluZWQgb3IgcmV0dXJucyB1bmRlZmluZWQuXG4gICAqL1xuICBvcHRpb25hbEZhaWx1cmVUb09wdGlvbmFsRXJyb3IoXG4gICAgZmFpbHVyZTogUHJvdG9GYWlsdXJlIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwYXlsb2FkQ29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyXG4gICk6IFRlbXBvcmFsRmFpbHVyZSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIGZhaWx1cmUgPyB0aGlzLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUsIHBheWxvYWRDb252ZXJ0ZXIpIDogdW5kZWZpbmVkO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGFuIGVycm9yIHRvIGEgRmFpbHVyZSBwcm90byBtZXNzYWdlIGlmIGRlZmluZWQgb3IgcmV0dXJucyB1bmRlZmluZWRcbiAgICovXG4gIG9wdGlvbmFsRXJyb3JUb09wdGlvbmFsRmFpbHVyZShlcnI6IHVua25vd24sIHBheWxvYWRDb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIpOiBQcm90b0ZhaWx1cmUgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiBlcnIgPyB0aGlzLmVycm9yVG9GYWlsdXJlKGVyciwgcGF5bG9hZENvbnZlcnRlcikgOiB1bmRlZmluZWQ7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBgUGF5bG9hZENvZGVjYCBpcyBhbiBvcHRpb25hbCBzdGVwIHRoYXQgaGFwcGVucyBiZXR3ZWVuIHRoZSB3aXJlIGFuZCB0aGUge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9OlxuICpcbiAqIFRlbXBvcmFsIFNlcnZlciA8LS0+IFdpcmUgPC0tPiBgUGF5bG9hZENvZGVjYCA8LS0+IGBQYXlsb2FkQ29udmVydGVyYCA8LS0+IFVzZXIgY29kZVxuICpcbiAqIEltcGxlbWVudCB0aGlzIHRvIHRyYW5zZm9ybSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIHRvL2Zyb20gdGhlIGZvcm1hdCBzZW50IG92ZXIgdGhlIHdpcmUgYW5kIHN0b3JlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBDb21tb24gdHJhbnNmb3JtYXRpb25zIGFyZSBlbmNyeXB0aW9uIGFuZCBjb21wcmVzc2lvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXlsb2FkQ29kZWMge1xuICAvKipcbiAgICogRW5jb2RlIGFuIGFycmF5IG9mIHtAbGluayBQYXlsb2FkfXMgZm9yIHNlbmRpbmcgb3ZlciB0aGUgd2lyZS5cbiAgICogQHBhcmFtIHBheWxvYWRzIE1heSBoYXZlIGxlbmd0aCAwLlxuICAgKi9cbiAgZW5jb2RlKHBheWxvYWRzOiBQYXlsb2FkW10pOiBQcm9taXNlPFBheWxvYWRbXT47XG5cbiAgLyoqXG4gICAqIERlY29kZSBhbiBhcnJheSBvZiB7QGxpbmsgUGF5bG9hZH1zIHJlY2VpdmVkIGZyb20gdGhlIHdpcmUuXG4gICAqL1xuICBkZWNvZGUocGF5bG9hZHM6IFBheWxvYWRbXSk6IFByb21pc2U8UGF5bG9hZFtdPjtcbn1cbiIsImltcG9ydCB7IGRlY29kZSwgZW5jb2RlIH0gZnJvbSAnLi4vZW5jb2RpbmcnO1xuaW1wb3J0IHsgUGF5bG9hZENvbnZlcnRlckVycm9yLCBWYWx1ZUVycm9yIH0gZnJvbSAnLi4vZXJyb3JzJztcbmltcG9ydCB7IFBheWxvYWQgfSBmcm9tICcuLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGVuY29kaW5nS2V5cywgZW5jb2RpbmdUeXBlcywgTUVUQURBVEFfRU5DT0RJTkdfS0VZIH0gZnJvbSAnLi90eXBlcyc7XG5cbi8qKlxuICogVXNlZCBieSB0aGUgZnJhbWV3b3JrIHRvIHNlcmlhbGl6ZS9kZXNlcmlhbGl6ZSBkYXRhIGxpa2UgcGFyYW1ldGVycyBhbmQgcmV0dXJuIHZhbHVlcy5cbiAqXG4gKiBUaGlzIGlzIGNhbGxlZCBpbnNpZGUgdGhlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9kZXRlcm1pbmlzbSB8IFdvcmtmbG93IGlzb2xhdGV9LlxuICogVG8gd3JpdGUgYXN5bmMgY29kZSBvciB1c2UgTm9kZSBBUElzIChvciB1c2UgcGFja2FnZXMgdGhhdCB1c2UgTm9kZSBBUElzKSwgdXNlIGEge0BsaW5rIFBheWxvYWRDb2RlY30uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlciB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfS5cbiAgICpcbiAgICogU2hvdWxkIHRocm93IHtAbGluayBWYWx1ZUVycm9yfSBpZiB1bmFibGUgdG8gY29udmVydC5cbiAgICovXG4gIHRvUGF5bG9hZDxUPih2YWx1ZTogVCk6IFBheWxvYWQ7XG5cbiAgLyoqXG4gICAqIENvbnZlcnRzIGEge0BsaW5rIFBheWxvYWR9IGJhY2sgdG8gYSB2YWx1ZS5cbiAgICovXG4gIGZyb21QYXlsb2FkPFQ+KHBheWxvYWQ6IFBheWxvYWQpOiBUO1xufVxuXG4vKipcbiAqIEltcGxlbWVudHMgY29udmVyc2lvbiBvZiBhIGxpc3Qgb2YgdmFsdWVzLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSB2YWx1ZXMgSlMgdmFsdWVzIHRvIGNvbnZlcnQgdG8gUGF5bG9hZHNcbiAqIEByZXR1cm4gbGlzdCBvZiB7QGxpbmsgUGF5bG9hZH1zXG4gKiBAdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiBjb252ZXJzaW9uIG9mIHRoZSB2YWx1ZSBwYXNzZWQgYXMgcGFyYW1ldGVyIGZhaWxlZCBmb3IgYW55XG4gKiAgICAgcmVhc29uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9QYXlsb2Fkcyhjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIC4uLnZhbHVlczogdW5rbm93bltdKTogUGF5bG9hZFtdIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZhbHVlcy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHZhbHVlcy5tYXAoKHZhbHVlKSA9PiBjb252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlKSk7XG59XG5cbi8qKlxuICogUnVuIHtAbGluayBQYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZH0gb24gZWFjaCB2YWx1ZSBpbiB0aGUgbWFwLlxuICpcbiAqIEB0aHJvd3Mge0BsaW5rIFZhbHVlRXJyb3J9IGlmIGNvbnZlcnNpb24gb2YgYW55IHZhbHVlIGluIHRoZSBtYXAgZmFpbHNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFRvUGF5bG9hZHM8SyBleHRlbmRzIHN0cmluZz4oY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLCBtYXA6IFJlY29yZDxLLCBhbnk+KTogUmVjb3JkPEssIFBheWxvYWQ+IHtcbiAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhcbiAgICBPYmplY3QuZW50cmllcyhtYXApLm1hcCgoW2ssIHZdKTogW0ssIFBheWxvYWRdID0+IFtrIGFzIEssIGNvbnZlcnRlci50b1BheWxvYWQodildKVxuICApIGFzIFJlY29yZDxLLCBQYXlsb2FkPjtcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnRzIGNvbnZlcnNpb24gb2YgYW4gYXJyYXkgb2YgdmFsdWVzIG9mIGRpZmZlcmVudCB0eXBlcy4gVXNlZnVsIGZvciBkZXNlcmlhbGl6aW5nXG4gKiBhcmd1bWVudHMgb2YgZnVuY3Rpb24gaW52b2NhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlclxuICogQHBhcmFtIGluZGV4IGluZGV4IG9mIHRoZSB2YWx1ZSBpbiB0aGUgcGF5bG9hZHNcbiAqIEBwYXJhbSBwYXlsb2FkcyBzZXJpYWxpemVkIHZhbHVlIHRvIGNvbnZlcnQgdG8gSlMgdmFsdWVzLlxuICogQHJldHVybiBjb252ZXJ0ZWQgSlMgdmFsdWVcbiAqIEB0aHJvd3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJFcnJvcn0gaWYgY29udmVyc2lvbiBvZiB0aGUgZGF0YSBwYXNzZWQgYXMgcGFyYW1ldGVyIGZhaWxlZCBmb3IgYW55XG4gKiAgICAgcmVhc29uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVBheWxvYWRzQXRJbmRleDxUPihjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIGluZGV4OiBudW1iZXIsIHBheWxvYWRzPzogUGF5bG9hZFtdIHwgbnVsbCk6IFQge1xuICAvLyBUbyBtYWtlIGFkZGluZyBhcmd1bWVudHMgYSBiYWNrd2FyZHMgY29tcGF0aWJsZSBjaGFuZ2VcbiAgaWYgKHBheWxvYWRzID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZHMgPT09IG51bGwgfHwgaW5kZXggPj0gcGF5bG9hZHMubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZCBhcyBhbnk7XG4gIH1cbiAgcmV0dXJuIGNvbnZlcnRlci5mcm9tUGF5bG9hZChwYXlsb2Fkc1tpbmRleF0pO1xufVxuXG4vKipcbiAqIFJ1biB7QGxpbmsgUGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZH0gb24gZWFjaCB2YWx1ZSBpbiB0aGUgYXJyYXkuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUZyb21QYXlsb2Fkcyhjb252ZXJ0ZXI6IFBheWxvYWRDb252ZXJ0ZXIsIHBheWxvYWRzPzogUGF5bG9hZFtdIHwgbnVsbCk6IHVua25vd25bXSB7XG4gIGlmICghcGF5bG9hZHMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgcmV0dXJuIHBheWxvYWRzLm1hcCgocGF5bG9hZDogUGF5bG9hZCkgPT4gY29udmVydGVyLmZyb21QYXlsb2FkKHBheWxvYWQpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcEZyb21QYXlsb2FkczxLIGV4dGVuZHMgc3RyaW5nPihcbiAgY29udmVydGVyOiBQYXlsb2FkQ29udmVydGVyLFxuICBtYXA/OiBSZWNvcmQ8SywgUGF5bG9hZD4gfCBudWxsIHwgdW5kZWZpbmVkXG4pOiBSZWNvcmQ8SywgdW5rbm93bj4gfCB1bmRlZmluZWQgfCBudWxsIHtcbiAgaWYgKG1hcCA9PSBudWxsKSByZXR1cm4gbWFwO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKFxuICAgIE9iamVjdC5lbnRyaWVzKG1hcCkubWFwKChbaywgcGF5bG9hZF0pOiBbSywgdW5rbm93bl0gPT4ge1xuICAgICAgY29uc3QgdmFsdWUgPSBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCBhcyBQYXlsb2FkKTtcbiAgICAgIHJldHVybiBbayBhcyBLLCB2YWx1ZV07XG4gICAgfSlcbiAgKSBhcyBSZWNvcmQ8SywgdW5rbm93bj47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGEge0BsaW5rIFBheWxvYWR9LlxuICAgKlxuICAgKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHRvIGNvbnZlcnQuIEV4YW1wbGUgdmFsdWVzIGluY2x1ZGUgdGhlIFdvcmtmbG93IGFyZ3Mgc2VudCBmcm9tIHRoZSBDbGllbnQgYW5kIHRoZSB2YWx1ZXMgcmV0dXJuZWQgYnkgYSBXb3JrZmxvdyBvciBBY3Rpdml0eS5cbiAgICogQHJldHVybnMgVGhlIHtAbGluayBQYXlsb2FkfSwgb3IgYHVuZGVmaW5lZGAgaWYgdW5hYmxlIHRvIGNvbnZlcnQuXG4gICAqL1xuICB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHwgdW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBDb252ZXJ0cyBhIHtAbGluayBQYXlsb2FkfSBiYWNrIHRvIGEgdmFsdWUuXG4gICAqL1xuICBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVDtcblxuICByZWFkb25seSBlbmNvZGluZ1R5cGU6IHN0cmluZztcbn1cblxuLyoqXG4gKiBUcmllcyB0byBjb252ZXJ0IHZhbHVlcyB0byB7QGxpbmsgUGF5bG9hZH1zIHVzaW5nIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ31zIHByb3ZpZGVkIHRvIHRoZSBjb25zdHJ1Y3RvciwgaW4gdGhlIG9yZGVyIHByb3ZpZGVkLlxuICpcbiAqIENvbnZlcnRzIFBheWxvYWRzIHRvIHZhbHVlcyBiYXNlZCBvbiB0aGUgYFBheWxvYWQubWV0YWRhdGEuZW5jb2RpbmdgIGZpZWxkLCB3aGljaCBtYXRjaGVzIHRoZSB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZy5lbmNvZGluZ1R5cGV9XG4gKiBvZiB0aGUgY29udmVydGVyIHRoYXQgY3JlYXRlZCB0aGUgUGF5bG9hZC5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvc2l0ZVBheWxvYWRDb252ZXJ0ZXIgaW1wbGVtZW50cyBQYXlsb2FkQ29udmVydGVyIHtcbiAgcmVhZG9ubHkgY29udmVydGVyczogUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZ1tdO1xuICByZWFkb25seSBjb252ZXJ0ZXJCeUVuY29kaW5nOiBNYXA8c3RyaW5nLCBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nPiA9IG5ldyBNYXAoKTtcblxuICBjb25zdHJ1Y3RvciguLi5jb252ZXJ0ZXJzOiBQYXlsb2FkQ29udmVydGVyV2l0aEVuY29kaW5nW10pIHtcbiAgICBpZiAoY29udmVydGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBQYXlsb2FkQ29udmVydGVyRXJyb3IoJ011c3QgcHJvdmlkZSBhdCBsZWFzdCBvbmUgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZycpO1xuICAgIH1cblxuICAgIHRoaXMuY29udmVydGVycyA9IGNvbnZlcnRlcnM7XG4gICAgZm9yIChjb25zdCBjb252ZXJ0ZXIgb2YgY29udmVydGVycykge1xuICAgICAgdGhpcy5jb252ZXJ0ZXJCeUVuY29kaW5nLnNldChjb252ZXJ0ZXIuZW5jb2RpbmdUeXBlLCBjb252ZXJ0ZXIpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUcmllcyB0byBydW4gYC50b1BheWxvYWQodmFsdWUpYCBvbiBlYWNoIGNvbnZlcnRlciBpbiB0aGUgb3JkZXIgcHJvdmlkZWQgYXQgY29uc3RydWN0aW9uLlxuICAgKiBSZXR1cm5zIHRoZSBmaXJzdCBzdWNjZXNzZnVsIHJlc3VsdCwgdGhyb3dzIHtAbGluayBWYWx1ZUVycm9yfSBpZiB0aGVyZSBpcyBubyBjb252ZXJ0ZXIgdGhhdCBjYW4gaGFuZGxlIHRoZSB2YWx1ZS5cbiAgICovXG4gIHB1YmxpYyB0b1BheWxvYWQ8VD4odmFsdWU6IFQpOiBQYXlsb2FkIHtcbiAgICBmb3IgKGNvbnN0IGNvbnZlcnRlciBvZiB0aGlzLmNvbnZlcnRlcnMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbnZlcnRlci50b1BheWxvYWQodmFsdWUpO1xuICAgICAgaWYgKHJlc3VsdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVuYWJsZSB0byBjb252ZXJ0ICR7dmFsdWV9IHRvIHBheWxvYWRgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSdW4ge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2RpbmcuZnJvbVBheWxvYWR9IGJhc2VkIG9uIHRoZSBgZW5jb2RpbmdgIG1ldGFkYXRhIG9mIHRoZSB7QGxpbmsgUGF5bG9hZH0uXG4gICAqL1xuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4ocGF5bG9hZDogUGF5bG9hZCk6IFQge1xuICAgIGlmIChwYXlsb2FkLm1ldGFkYXRhID09PSB1bmRlZmluZWQgfHwgcGF5bG9hZC5tZXRhZGF0YSA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ01pc3NpbmcgcGF5bG9hZCBtZXRhZGF0YScpO1xuICAgIH1cbiAgICBjb25zdCBlbmNvZGluZyA9IGRlY29kZShwYXlsb2FkLm1ldGFkYXRhW01FVEFEQVRBX0VOQ09ESU5HX0tFWV0pO1xuICAgIGNvbnN0IGNvbnZlcnRlciA9IHRoaXMuY29udmVydGVyQnlFbmNvZGluZy5nZXQoZW5jb2RpbmcpO1xuICAgIGlmIChjb252ZXJ0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYFVua25vd24gZW5jb2Rpbmc6ICR7ZW5jb2Rpbmd9YCk7XG4gICAgfVxuICAgIHJldHVybiBjb252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIEpTIHVuZGVmaW5lZCBhbmQgTlVMTCBQYXlsb2FkXG4gKi9cbmV4cG9ydCBjbGFzcyBVbmRlZmluZWRQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEw7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBtZXRhZGF0YToge1xuICAgICAgICBbTUVUQURBVEFfRU5DT0RJTkdfS0VZXTogZW5jb2RpbmdLZXlzLk1FVEFEQVRBX0VOQ09ESU5HX05VTEwsXG4gICAgICB9LFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oX2NvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkIGFzIGFueTsgLy8gSnVzdCByZXR1cm4gdW5kZWZpbmVkXG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBiZXR3ZWVuIGJpbmFyeSBkYXRhIHR5cGVzIGFuZCBSQVcgUGF5bG9hZFxuICovXG5leHBvcnQgY2xhc3MgQmluYXJ5UGF5bG9hZENvbnZlcnRlciBpbXBsZW1lbnRzIFBheWxvYWRDb252ZXJ0ZXJXaXRoRW5jb2Rpbmcge1xuICBwdWJsaWMgZW5jb2RpbmdUeXBlID0gZW5jb2RpbmdUeXBlcy5NRVRBREFUQV9FTkNPRElOR19SQVc7XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgVWludDhBcnJheSkpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIG1ldGFkYXRhOiB7XG4gICAgICAgIFtNRVRBREFUQV9FTkNPRElOR19LRVldOiBlbmNvZGluZ0tleXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IHZhbHVlLFxuICAgIH07XG4gIH1cblxuICBwdWJsaWMgZnJvbVBheWxvYWQ8VD4oY29udGVudDogUGF5bG9hZCk6IFQge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBXcmFwIHdpdGggVWludDhBcnJheSBmcm9tIHRoaXMgY29udGV4dCB0byBlbnN1cmUgYGluc3RhbmNlb2ZgIHdvcmtzXG4gICAgICAoXG4gICAgICAgIGNvbnRlbnQuZGF0YSA/IG5ldyBVaW50OEFycmF5KGNvbnRlbnQuZGF0YS5idWZmZXIsIGNvbnRlbnQuZGF0YS5ieXRlT2Zmc2V0LCBjb250ZW50LmRhdGEubGVuZ3RoKSA6IGNvbnRlbnQuZGF0YVxuICAgICAgKSBhcyBhbnlcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogQ29udmVydHMgYmV0d2VlbiBub24tdW5kZWZpbmVkIHZhbHVlcyBhbmQgc2VyaWFsaXplZCBKU09OIFBheWxvYWRcbiAqL1xuZXhwb3J0IGNsYXNzIEpzb25QYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlcldpdGhFbmNvZGluZyB7XG4gIHB1YmxpYyBlbmNvZGluZ1R5cGUgPSBlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX0pTT047XG5cbiAgcHVibGljIHRvUGF5bG9hZCh2YWx1ZTogdW5rbm93bik6IFBheWxvYWQgfCB1bmRlZmluZWQge1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBqc29uO1xuICAgIHRyeSB7XG4gICAgICBqc29uID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbWV0YWRhdGE6IHtcbiAgICAgICAgW01FVEFEQVRBX0VOQ09ESU5HX0tFWV06IGVuY29kaW5nS2V5cy5NRVRBREFUQV9FTkNPRElOR19KU09OLFxuICAgICAgfSxcbiAgICAgIGRhdGE6IGVuY29kZShqc29uKSxcbiAgICB9O1xuICB9XG5cbiAgcHVibGljIGZyb21QYXlsb2FkPFQ+KGNvbnRlbnQ6IFBheWxvYWQpOiBUIHtcbiAgICBpZiAoY29udGVudC5kYXRhID09PSB1bmRlZmluZWQgfHwgY29udGVudC5kYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignR290IHBheWxvYWQgd2l0aCBubyBkYXRhJyk7XG4gICAgfVxuICAgIHJldHVybiBKU09OLnBhcnNlKGRlY29kZShjb250ZW50LmRhdGEpKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnRzIFNlYXJjaCBBdHRyaWJ1dGUgdmFsdWVzIHVzaW5nIEpzb25QYXlsb2FkQ29udmVydGVyXG4gKi9cbmV4cG9ydCBjbGFzcyBTZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyIGltcGxlbWVudHMgUGF5bG9hZENvbnZlcnRlciB7XG4gIGpzb25Db252ZXJ0ZXIgPSBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKTtcbiAgdmFsaWROb25EYXRlVHlwZXMgPSBbJ3N0cmluZycsICdudW1iZXInLCAnYm9vbGVhbiddO1xuXG4gIHB1YmxpYyB0b1BheWxvYWQodmFsdWVzOiB1bmtub3duKTogUGF5bG9hZCB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHtcbiAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKGBTZWFyY2hBdHRyaWJ1dGUgdmFsdWUgbXVzdCBiZSBhbiBhcnJheWApO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZXMubGVuZ3RoID4gMCkge1xuICAgICAgY29uc3QgZmlyc3RWYWx1ZSA9IHZhbHVlc1swXTtcbiAgICAgIGNvbnN0IGZpcnN0VHlwZSA9IHR5cGVvZiBmaXJzdFZhbHVlO1xuICAgICAgaWYgKGZpcnN0VHlwZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZm9yIChjb25zdCBbaWR4LCB2YWx1ZV0gb2YgdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmICghKHZhbHVlIGluc3RhbmNlb2YgRGF0ZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKFxuICAgICAgICAgICAgICBgU2VhcmNoQXR0cmlidXRlIHZhbHVlcyBtdXN0IGFycmF5cyBvZiBzdHJpbmdzLCBudW1iZXJzLCBib29sZWFucywgb3IgRGF0ZXMuIFRoZSB2YWx1ZSAke3ZhbHVlfSBhdCBpbmRleCAke2lkeH0gaXMgb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKCF0aGlzLnZhbGlkTm9uRGF0ZVR5cGVzLmluY2x1ZGVzKGZpcnN0VHlwZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcihgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgRGF0ZWApO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChjb25zdCBbaWR4LCB2YWx1ZV0gb2YgdmFsdWVzLmVudHJpZXMoKSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IGZpcnN0VHlwZSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoXG4gICAgICAgICAgICAgIGBBbGwgU2VhcmNoQXR0cmlidXRlIGFycmF5IHZhbHVlcyBtdXN0IGJlIG9mIHRoZSBzYW1lIHR5cGUuIFRoZSBmaXJzdCB2YWx1ZSAke2ZpcnN0VmFsdWV9IG9mIHR5cGUgJHtmaXJzdFR5cGV9IGRvZXNuJ3QgbWF0Y2ggdmFsdWUgJHt2YWx1ZX0gb2YgdHlwZSAke3R5cGVvZiB2YWx1ZX0gYXQgaW5kZXggJHtpZHh9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBKU09OLnN0cmluZ2lmeSB0YWtlcyBjYXJlIG9mIGNvbnZlcnRpbmcgRGF0ZXMgdG8gSVNPIHN0cmluZ3NcbiAgICBjb25zdCByZXQgPSB0aGlzLmpzb25Db252ZXJ0ZXIudG9QYXlsb2FkKHZhbHVlcyk7XG4gICAgaWYgKHJldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignQ291bGQgbm90IGNvbnZlcnQgc2VhcmNoIGF0dHJpYnV0ZXMgdG8gcGF5bG9hZHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEYXRldGltZSBTZWFyY2ggQXR0cmlidXRlIHZhbHVlcyBhcmUgY29udmVydGVkIHRvIGBEYXRlYHNcbiAgICovXG4gIHB1YmxpYyBmcm9tUGF5bG9hZDxUPihwYXlsb2FkOiBQYXlsb2FkKTogVCB7XG4gICAgaWYgKHBheWxvYWQubWV0YWRhdGEgPT09IHVuZGVmaW5lZCB8fCBwYXlsb2FkLm1ldGFkYXRhID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignTWlzc2luZyBwYXlsb2FkIG1ldGFkYXRhJyk7XG4gICAgfVxuXG4gICAgY29uc3QgdmFsdWUgPSB0aGlzLmpzb25Db252ZXJ0ZXIuZnJvbVBheWxvYWQocGF5bG9hZCk7XG4gICAgbGV0IGFycmF5V3JhcHBlZFZhbHVlID0gQXJyYXkuaXNBcnJheSh2YWx1ZSkgPyB2YWx1ZSA6IFt2YWx1ZV07XG5cbiAgICBjb25zdCBzZWFyY2hBdHRyaWJ1dGVUeXBlID0gZGVjb2RlKHBheWxvYWQubWV0YWRhdGEudHlwZSk7XG4gICAgaWYgKHNlYXJjaEF0dHJpYnV0ZVR5cGUgPT09ICdEYXRldGltZScpIHtcbiAgICAgIGFycmF5V3JhcHBlZFZhbHVlID0gYXJyYXlXcmFwcGVkVmFsdWUubWFwKChkYXRlU3RyaW5nKSA9PiBuZXcgRGF0ZShkYXRlU3RyaW5nKSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheVdyYXBwZWRWYWx1ZSBhcyB1bmtub3duIGFzIFQ7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgU2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlcigpO1xuXG5leHBvcnQgY2xhc3MgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgZXh0ZW5kcyBDb21wb3NpdGVQYXlsb2FkQ29udmVydGVyIHtcbiAgLy8gTWF0Y2ggdGhlIG9yZGVyIHVzZWQgaW4gb3RoZXIgU0RLcywgYnV0IGV4Y2x1ZGUgUHJvdG9idWYgY29udmVydGVycyBzbyB0aGF0IHRoZSBjb2RlLCBpbmNsdWRpbmdcbiAgLy8gYHByb3RvMy1qc29uLXNlcmlhbGl6ZXJgLCBkb2Vzbid0IHRha2Ugc3BhY2UgaW4gV29ya2Zsb3cgYnVuZGxlcyB0aGF0IGRvbid0IHVzZSBQcm90b2J1ZnMuIFRvIHVzZSBQcm90b2J1ZnMsIHVzZVxuICAvLyB7QGxpbmsgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXJXaXRoUHJvdG9idWZzfS5cbiAgLy9cbiAgLy8gR28gU0RLOlxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vdGVtcG9yYWxpby9zZGstZ28vYmxvYi81ZTU2NDVmMGM1NTBkY2Y3MTdjMDk1YWUzMmM3NmE3MDg3ZDJlOTg1L2NvbnZlcnRlci9kZWZhdWx0X2RhdGFfY29udmVydGVyLmdvI0wyOFxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcihuZXcgVW5kZWZpbmVkUGF5bG9hZENvbnZlcnRlcigpLCBuZXcgQmluYXJ5UGF5bG9hZENvbnZlcnRlcigpLCBuZXcgSnNvblBheWxvYWRDb252ZXJ0ZXIoKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgZGVmYXVsdCB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0gdXNlZCBieSB0aGUgU0RLLiBTdXBwb3J0cyBgVWludDhBcnJheWAgYW5kIEpTT04gc2VyaWFsaXphYmxlcyAoc28gaWZcbiAqIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9KU09OL3N0cmluZ2lmeSNkZXNjcmlwdGlvbiB8IGBKU09OLnN0cmluZ2lmeSh5b3VyQXJnT3JSZXR2YWwpYH1cbiAqIHdvcmtzLCB0aGUgZGVmYXVsdCBwYXlsb2FkIGNvbnZlcnRlciB3aWxsIHdvcmspLlxuICpcbiAqIFRvIGFsc28gc3VwcG9ydCBQcm90b2J1ZnMsIGNyZWF0ZSBhIGN1c3RvbSBwYXlsb2FkIGNvbnZlcnRlciB3aXRoIHtAbGluayBEZWZhdWx0UGF5bG9hZENvbnZlcnRlcn06XG4gKlxuICogYGNvbnN0IG15Q29udmVydGVyID0gbmV3IERlZmF1bHRQYXlsb2FkQ29udmVydGVyKHsgcHJvdG9idWZSb290IH0pYFxuICovXG5leHBvcnQgY29uc3QgZGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIgPSBuZXcgRGVmYXVsdFBheWxvYWRDb252ZXJ0ZXIoKTtcbiIsImltcG9ydCB7IGVuY29kZSB9IGZyb20gJy4uL2VuY29kaW5nJztcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX0VOQ09ESU5HX0tFWSA9ICdlbmNvZGluZyc7XG5leHBvcnQgY29uc3QgZW5jb2RpbmdUeXBlcyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogJ2JpbmFyeS9udWxsJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfUkFXOiAnYmluYXJ5L3BsYWluJyxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogJ2pzb24vcGxhaW4nLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRl9KU09OOiAnanNvbi9wcm90b2J1ZicsXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGOiAnYmluYXJ5L3Byb3RvYnVmJyxcbn0gYXMgY29uc3Q7XG5leHBvcnQgdHlwZSBFbmNvZGluZ1R5cGUgPSAodHlwZW9mIGVuY29kaW5nVHlwZXMpW2tleW9mIHR5cGVvZiBlbmNvZGluZ1R5cGVzXTtcblxuZXhwb3J0IGNvbnN0IGVuY29kaW5nS2V5cyA9IHtcbiAgTUVUQURBVEFfRU5DT0RJTkdfTlVMTDogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfTlVMTCksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1JBVzogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUkFXKSxcbiAgTUVUQURBVEFfRU5DT0RJTkdfSlNPTjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfSlNPTiksXG4gIE1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT046IGVuY29kZShlbmNvZGluZ1R5cGVzLk1FVEFEQVRBX0VOQ09ESU5HX1BST1RPQlVGX0pTT04pLFxuICBNRVRBREFUQV9FTkNPRElOR19QUk9UT0JVRjogZW5jb2RlKGVuY29kaW5nVHlwZXMuTUVUQURBVEFfRU5DT0RJTkdfUFJPVE9CVUYpLFxufSBhcyBjb25zdDtcblxuZXhwb3J0IGNvbnN0IE1FVEFEQVRBX01FU1NBR0VfVFlQRV9LRVkgPSAnbWVzc2FnZVR5cGUnO1xuIiwiaW1wb3J0ICogYXMgdGltZSBmcm9tICcuL3RpbWUnO1xuaW1wb3J0IHsgdHlwZSBUaW1lc3RhbXAsIER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3cuXG4gKiBJZiB0cyBpcyBudWxsIG9yIHVuZGVmaW5lZCByZXR1cm5zIHVuZGVmaW5lZC5cbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWxUc1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICByZXR1cm4gdGltZS5vcHRpb25hbFRzVG9Ncyh0cyk7XG59XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93XG4gKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0c1RvTXModHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBudW1iZXIge1xuICByZXR1cm4gdGltZS50c1RvTXModHMpO1xufVxuXG4vKipcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtc051bWJlclRvVHMobWlsbGlzOiBudW1iZXIpOiBUaW1lc3RhbXAge1xuICByZXR1cm4gdGltZS5tc051bWJlclRvVHMobWlsbGlzKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNUb1RzKHN0cjogRHVyYXRpb24pOiBUaW1lc3RhbXAge1xuICByZXR1cm4gdGltZS5tc1RvVHMoc3RyKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiB0aW1lLm1zT3B0aW9uYWxUb1RzKHN0cik7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUubXNPcHRpb25hbFRvTnVtYmVyKHZhbCk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1zVG9OdW1iZXIodmFsOiBEdXJhdGlvbik6IG51bWJlciB7XG4gIHJldHVybiB0aW1lLm1zVG9OdW1iZXIodmFsKTtcbn1cblxuLyoqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHNUb0RhdGUodHM6IFRpbWVzdGFtcCk6IERhdGUge1xuICByZXR1cm4gdGltZS50c1RvRGF0ZSh0cyk7XG59XG5cbi8qKlxuICogQGhpZGRlblxuICogQGRlcHJlY2F0ZWQgLSBtZWFudCBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIHRpbWUub3B0aW9uYWxUc1RvRGF0ZSh0cyk7XG59XG4iLCIvLyBQYXN0ZWQgd2l0aCBtb2RpZmljYXRpb25zIGZyb206IGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9hbm9ueWNvL0Zhc3Rlc3RTbWFsbGVzdFRleHRFbmNvZGVyRGVjb2Rlci9tYXN0ZXIvRW5jb2RlckRlY29kZXJUb2dldGhlci5zcmMuanNcbi8qIGVzbGludCBuby1mYWxsdGhyb3VnaDogMCAqL1xuXG5jb25zdCBmcm9tQ2hhckNvZGUgPSBTdHJpbmcuZnJvbUNoYXJDb2RlO1xuY29uc3QgZW5jb2RlclJlZ2V4cCA9IC9bXFx4ODAtXFx1RDdmZlxcdURDMDAtXFx1RkZGRl18W1xcdUQ4MDAtXFx1REJGRl1bXFx1REMwMC1cXHVERkZGXT8vZztcbmNvbnN0IHRtcEJ1ZmZlclUxNiA9IG5ldyBVaW50MTZBcnJheSgzMik7XG5cbmV4cG9ydCBjbGFzcyBUZXh0RGVjb2RlciB7XG4gIGRlY29kZShpbnB1dEFycmF5T3JCdWZmZXI6IFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlciB8IFNoYXJlZEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgICBjb25zdCBpbnB1dEFzOCA9IGlucHV0QXJyYXlPckJ1ZmZlciBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBpbnB1dEFycmF5T3JCdWZmZXIgOiBuZXcgVWludDhBcnJheShpbnB1dEFycmF5T3JCdWZmZXIpO1xuXG4gICAgbGV0IHJlc3VsdGluZ1N0cmluZyA9ICcnLFxuICAgICAgdG1wU3RyID0gJycsXG4gICAgICBpbmRleCA9IDAsXG4gICAgICBuZXh0RW5kID0gMCxcbiAgICAgIGNwMCA9IDAsXG4gICAgICBjb2RlUG9pbnQgPSAwLFxuICAgICAgbWluQml0cyA9IDAsXG4gICAgICBjcDEgPSAwLFxuICAgICAgcG9zID0gMCxcbiAgICAgIHRtcCA9IC0xO1xuICAgIGNvbnN0IGxlbiA9IGlucHV0QXM4Lmxlbmd0aCB8IDA7XG4gICAgY29uc3QgbGVuTWludXMzMiA9IChsZW4gLSAzMikgfCAwO1xuICAgIC8vIE5vdGUgdGhhdCB0bXAgcmVwcmVzZW50cyB0aGUgMm5kIGhhbGYgb2YgYSBzdXJyb2dhdGUgcGFpciBpbmNhc2UgYSBzdXJyb2dhdGUgZ2V0cyBkaXZpZGVkIGJldHdlZW4gYmxvY2tzXG4gICAgZm9yICg7IGluZGV4IDwgbGVuOyApIHtcbiAgICAgIG5leHRFbmQgPSBpbmRleCA8PSBsZW5NaW51czMyID8gMzIgOiAobGVuIC0gaW5kZXgpIHwgMDtcbiAgICAgIGZvciAoOyBwb3MgPCBuZXh0RW5kOyBpbmRleCA9IChpbmRleCArIDEpIHwgMCwgcG9zID0gKHBvcyArIDEpIHwgMCkge1xuICAgICAgICBjcDAgPSBpbnB1dEFzOFtpbmRleF0gJiAweGZmO1xuICAgICAgICBzd2l0Y2ggKGNwMCA+PiA0KSB7XG4gICAgICAgICAgY2FzZSAxNTpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGlmIChjcDEgPj4gNiAhPT0gMGIxMCB8fCAwYjExMTEwMTExIDwgY3AwKSB7XG4gICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IC0gMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvZGVQb2ludCA9ICgoY3AwICYgMGIxMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IDU7IC8vIDIwIGVuc3VyZXMgaXQgbmV2ZXIgcGFzc2VzIC0+IGFsbCBpbnZhbGlkIHJlcGxhY2VtZW50c1xuICAgICAgICAgICAgY3AwID0gMHgxMDA7IC8vICBrZWVwIHRyYWNrIG9mIHRoIGJpdCBzaXplXG4gICAgICAgICAgY2FzZSAxNDpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGNvZGVQb2ludCA8PD0gNjtcbiAgICAgICAgICAgIGNvZGVQb2ludCB8PSAoKGNwMCAmIDBiMTExMSkgPDwgNikgfCAoY3AxICYgMGIwMDExMTExMSk7XG4gICAgICAgICAgICBtaW5CaXRzID0gY3AxID4+IDYgPT09IDBiMTAgPyAobWluQml0cyArIDQpIHwgMCA6IDI0OyAvLyAyNCBlbnN1cmVzIGl0IG5ldmVyIHBhc3NlcyAtPiBhbGwgaW52YWxpZCByZXBsYWNlbWVudHNcbiAgICAgICAgICAgIGNwMCA9IChjcDAgKyAweDEwMCkgJiAweDMwMDsgLy8ga2VlcCB0cmFjayBvZiB0aCBiaXQgc2l6ZVxuICAgICAgICAgIGNhc2UgMTM6XG4gICAgICAgICAgY2FzZSAxMjpcbiAgICAgICAgICAgIGNwMSA9IGlucHV0QXM4WyhpbmRleCA9IChpbmRleCArIDEpIHwgMCldICYgMHhmZjtcbiAgICAgICAgICAgIGNvZGVQb2ludCA8PD0gNjtcbiAgICAgICAgICAgIGNvZGVQb2ludCB8PSAoKGNwMCAmIDBiMTExMTEpIDw8IDYpIHwgKGNwMSAmIDBiMDAxMTExMTEpO1xuICAgICAgICAgICAgbWluQml0cyA9IChtaW5CaXRzICsgNykgfCAwO1xuXG4gICAgICAgICAgICAvLyBOb3csIHByb2Nlc3MgdGhlIGNvZGUgcG9pbnRcbiAgICAgICAgICAgIGlmIChpbmRleCA8IGxlbiAmJiBjcDEgPj4gNiA9PT0gMGIxMCAmJiBjb2RlUG9pbnQgPj4gbWluQml0cyAmJiBjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjcDAgPSBjb2RlUG9pbnQ7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IChjb2RlUG9pbnQgLSAweDEwMDAwKSB8IDA7XG4gICAgICAgICAgICAgIGlmICgwIDw9IGNvZGVQb2ludCAvKjB4ZmZmZiA8IGNvZGVQb2ludCovKSB7XG4gICAgICAgICAgICAgICAgLy8gQk1QIGNvZGUgcG9pbnRcbiAgICAgICAgICAgICAgICAvL25leHRFbmQgPSBuZXh0RW5kIC0gMXwwO1xuXG4gICAgICAgICAgICAgICAgdG1wID0gKChjb2RlUG9pbnQgPj4gMTApICsgMHhkODAwKSB8IDA7IC8vIGhpZ2hTdXJyb2dhdGVcbiAgICAgICAgICAgICAgICBjcDAgPSAoKGNvZGVQb2ludCAmIDB4M2ZmKSArIDB4ZGMwMCkgfCAwOyAvLyBsb3dTdXJyb2dhdGUgKHdpbGwgYmUgaW5zZXJ0ZWQgbGF0ZXIgaW4gdGhlIHN3aXRjaC1zdGF0ZW1lbnQpXG5cbiAgICAgICAgICAgICAgICBpZiAocG9zIDwgMzEpIHtcbiAgICAgICAgICAgICAgICAgIC8vIG5vdGljZSAzMSBpbnN0ZWFkIG9mIDMyXG4gICAgICAgICAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IHRtcDtcbiAgICAgICAgICAgICAgICAgIHBvcyA9IChwb3MgKyAxKSB8IDA7XG4gICAgICAgICAgICAgICAgICB0bXAgPSAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgLy8gZWxzZSwgd2UgYXJlIGF0IHRoZSBlbmQgb2YgdGhlIGlucHV0QXM4IGFuZCBsZXQgdG1wMCBiZSBmaWxsZWQgaW4gbGF0ZXIgb25cbiAgICAgICAgICAgICAgICAgIC8vIE5PVEUgdGhhdCBjcDEgaXMgYmVpbmcgdXNlZCBhcyBhIHRlbXBvcmFyeSB2YXJpYWJsZSBmb3IgdGhlIHN3YXBwaW5nIG9mIHRtcCB3aXRoIGNwMFxuICAgICAgICAgICAgICAgICAgY3AxID0gdG1wO1xuICAgICAgICAgICAgICAgICAgdG1wID0gY3AwO1xuICAgICAgICAgICAgICAgICAgY3AwID0gY3AxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIG5leHRFbmQgPSAobmV4dEVuZCArIDEpIHwgMDsgLy8gYmVjYXVzZSB3ZSBhcmUgYWR2YW5jaW5nIGkgd2l0aG91dCBhZHZhbmNpbmcgcG9zXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBpbnZhbGlkIGNvZGUgcG9pbnQgbWVhbnMgcmVwbGFjaW5nIHRoZSB3aG9sZSB0aGluZyB3aXRoIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyc1xuICAgICAgICAgICAgICBjcDAgPj49IDg7XG4gICAgICAgICAgICAgIGluZGV4ID0gKGluZGV4IC0gY3AwIC0gMSkgfCAwOyAvLyByZXNldCBpbmRleCAgYmFjayB0byB3aGF0IGl0IHdhcyBiZWZvcmVcbiAgICAgICAgICAgICAgY3AwID0gMHhmZmZkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBGaW5hbGx5LCByZXNldCB0aGUgdmFyaWFibGVzIGZvciB0aGUgbmV4dCBnby1hcm91bmRcbiAgICAgICAgICAgIG1pbkJpdHMgPSAwO1xuICAgICAgICAgICAgY29kZVBvaW50ID0gMDtcbiAgICAgICAgICAgIG5leHRFbmQgPSBpbmRleCA8PSBsZW5NaW51czMyID8gMzIgOiAobGVuIC0gaW5kZXgpIHwgMDtcbiAgICAgICAgICAvKmNhc2UgMTE6XG4gICAgICAgIGNhc2UgMTA6XG4gICAgICAgIGNhc2UgOTpcbiAgICAgICAgY2FzZSA4OlxuICAgICAgICAgIGNvZGVQb2ludCA/IGNvZGVQb2ludCA9IDAgOiBjcDAgPSAweGZmZmQ7IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgICBjYXNlIDc6XG4gICAgICAgIGNhc2UgNjpcbiAgICAgICAgY2FzZSA1OlxuICAgICAgICBjYXNlIDQ6XG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICBjYXNlIDE6XG4gICAgICAgIGNhc2UgMDpcbiAgICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IGNwMDtcbiAgICAgICAgICBjb250aW51ZTsqL1xuICAgICAgICAgIGRlZmF1bHQ6IC8vIGZpbGwgd2l0aCBpbnZhbGlkIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuICAgICAgICAgICAgdG1wQnVmZmVyVTE2W3Bvc10gPSBjcDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICBjYXNlIDExOlxuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIGNhc2UgODpcbiAgICAgICAgfVxuICAgICAgICB0bXBCdWZmZXJVMTZbcG9zXSA9IDB4ZmZmZDsgLy8gZmlsbCB3aXRoIGludmFsaWQgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG4gICAgICB9XG4gICAgICB0bXBTdHIgKz0gZnJvbUNoYXJDb2RlKFxuICAgICAgICB0bXBCdWZmZXJVMTZbMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxXSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzJdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls0XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzVdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNls3XSxcbiAgICAgICAgdG1wQnVmZmVyVTE2WzhdLFxuICAgICAgICB0bXBCdWZmZXJVMTZbOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsxOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyMl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyM10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyNl0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyN10sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyOF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlsyOV0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszMF0sXG4gICAgICAgIHRtcEJ1ZmZlclUxNlszMV1cbiAgICAgICk7XG4gICAgICBpZiAocG9zIDwgMzIpIHRtcFN0ciA9IHRtcFN0ci5zbGljZSgwLCAocG9zIC0gMzIpIHwgMCk7IC8vLSgzMi1wb3MpKTtcbiAgICAgIGlmIChpbmRleCA8IGxlbikge1xuICAgICAgICAvL2Zyb21DaGFyQ29kZS5hcHBseSgwLCB0bXBCdWZmZXJVMTYgOiBVaW50OEFycmF5ID8gIHRtcEJ1ZmZlclUxNi5zdWJhcnJheSgwLHBvcykgOiB0bXBCdWZmZXJVMTYuc2xpY2UoMCxwb3MpKTtcbiAgICAgICAgdG1wQnVmZmVyVTE2WzBdID0gdG1wO1xuICAgICAgICBwb3MgPSB+dG1wID4+PiAzMTsgLy90bXAgIT09IC0xID8gMSA6IDA7XG4gICAgICAgIHRtcCA9IC0xO1xuXG4gICAgICAgIGlmICh0bXBTdHIubGVuZ3RoIDwgcmVzdWx0aW5nU3RyaW5nLmxlbmd0aCkgY29udGludWU7XG4gICAgICB9IGVsc2UgaWYgKHRtcCAhPT0gLTEpIHtcbiAgICAgICAgdG1wU3RyICs9IGZyb21DaGFyQ29kZSh0bXApO1xuICAgICAgfVxuXG4gICAgICByZXN1bHRpbmdTdHJpbmcgKz0gdG1wU3RyO1xuICAgICAgdG1wU3RyID0gJyc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdGluZ1N0cmluZztcbiAgfVxufVxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuZnVuY3Rpb24gZW5jb2RlclJlcGxhY2VyKG5vbkFzY2lpQ2hhcnM6IHN0cmluZykge1xuICAvLyBtYWtlIHRoZSBVVEYgc3RyaW5nIGludG8gYSBiaW5hcnkgVVRGLTggZW5jb2RlZCBzdHJpbmdcbiAgbGV0IHBvaW50ID0gbm9uQXNjaWlDaGFycy5jaGFyQ29kZUF0KDApIHwgMDtcbiAgaWYgKDB4ZDgwMCA8PSBwb2ludCkge1xuICAgIGlmIChwb2ludCA8PSAweGRiZmYpIHtcbiAgICAgIGNvbnN0IG5leHRjb2RlID0gbm9uQXNjaWlDaGFycy5jaGFyQ29kZUF0KDEpIHwgMDsgLy8gZGVmYXVsdHMgdG8gMCB3aGVuIE5hTiwgY2F1c2luZyBudWxsIHJlcGxhY2VtZW50IGNoYXJhY3RlclxuXG4gICAgICBpZiAoMHhkYzAwIDw9IG5leHRjb2RlICYmIG5leHRjb2RlIDw9IDB4ZGZmZikge1xuICAgICAgICAvL3BvaW50ID0gKChwb2ludCAtIDB4RDgwMCk8PDEwKSArIG5leHRjb2RlIC0gMHhEQzAwICsgMHgxMDAwMHwwO1xuICAgICAgICBwb2ludCA9ICgocG9pbnQgPDwgMTApICsgbmV4dGNvZGUgLSAweDM1ZmRjMDApIHwgMDtcbiAgICAgICAgaWYgKHBvaW50ID4gMHhmZmZmKVxuICAgICAgICAgIHJldHVybiBmcm9tQ2hhckNvZGUoXG4gICAgICAgICAgICAoMHgxZSAvKjBiMTExMTAqLyA8PCAzKSB8IChwb2ludCA+PiAxOCksXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiAxMikgJiAweDNmKSAvKjBiMDAxMTExMTEqLyxcbiAgICAgICAgICAgICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDYpICYgMHgzZikgLyowYjAwMTExMTExKi8sXG4gICAgICAgICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi9cbiAgICAgICAgICApO1xuICAgICAgfSBlbHNlIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgfSBlbHNlIGlmIChwb2ludCA8PSAweGRmZmYpIHtcbiAgICAgIHBvaW50ID0gNjU1MzMgLyowYjExMTExMTExMTExMTExMDEqLzsgLy9yZXR1cm4gJ1xceEVGXFx4QkZcXHhCRCc7Ly9mcm9tQ2hhckNvZGUoMHhlZiwgMHhiZiwgMHhiZCk7XG4gICAgfVxuICB9XG4gIC8qaWYgKHBvaW50IDw9IDB4MDA3ZikgcmV0dXJuIG5vbkFzY2lpQ2hhcnM7XG4gIGVsc2UgKi8gaWYgKHBvaW50IDw9IDB4MDdmZikge1xuICAgIHJldHVybiBmcm9tQ2hhckNvZGUoKDB4NiA8PCA1KSB8IChwb2ludCA+PiA2KSwgKDB4MiA8PCA2KSB8IChwb2ludCAmIDB4M2YpKTtcbiAgfSBlbHNlXG4gICAgcmV0dXJuIGZyb21DaGFyQ29kZShcbiAgICAgICgweGUgLyowYjExMTAqLyA8PCA0KSB8IChwb2ludCA+PiAxMiksXG4gICAgICAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovLFxuICAgICAgKDB4MiAvKjBiMTAqLyA8PCA2KSB8IChwb2ludCAmIDB4M2YpIC8qMGIwMDExMTExMSovXG4gICAgKTtcbn1cblxuZXhwb3J0IGNsYXNzIFRleHRFbmNvZGVyIHtcbiAgcHVibGljIGVuY29kZShpbnB1dFN0cmluZzogc3RyaW5nKTogVWludDhBcnJheSB7XG4gICAgLy8gMHhjMCA9PiAwYjExMDAwMDAwOyAweGZmID0+IDBiMTExMTExMTE7IDB4YzAtMHhmZiA9PiAwYjExeHh4eHh4XG4gICAgLy8gMHg4MCA9PiAwYjEwMDAwMDAwOyAweGJmID0+IDBiMTAxMTExMTE7IDB4ODAtMHhiZiA9PiAwYjEweHh4eHh4XG4gICAgY29uc3QgZW5jb2RlZFN0cmluZyA9IGlucHV0U3RyaW5nID09PSB2b2lkIDAgPyAnJyA6ICcnICsgaW5wdXRTdHJpbmcsXG4gICAgICBsZW4gPSBlbmNvZGVkU3RyaW5nLmxlbmd0aCB8IDA7XG4gICAgbGV0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KCgobGVuIDw8IDEpICsgOCkgfCAwKTtcbiAgICBsZXQgdG1wUmVzdWx0OiBVaW50OEFycmF5O1xuICAgIGxldCBpID0gMCxcbiAgICAgIHBvcyA9IDAsXG4gICAgICBwb2ludCA9IDAsXG4gICAgICBuZXh0Y29kZSA9IDA7XG4gICAgbGV0IHVwZ3JhZGVkZWRBcnJheVNpemUgPSAhVWludDhBcnJheTsgLy8gbm9ybWFsIGFycmF5cyBhcmUgYXV0by1leHBhbmRpbmdcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpID0gKGkgKyAxKSB8IDAsIHBvcyA9IChwb3MgKyAxKSB8IDApIHtcbiAgICAgIHBvaW50ID0gZW5jb2RlZFN0cmluZy5jaGFyQ29kZUF0KGkpIHwgMDtcbiAgICAgIGlmIChwb2ludCA8PSAweDAwN2YpIHtcbiAgICAgICAgcmVzdWx0W3Bvc10gPSBwb2ludDtcbiAgICAgIH0gZWxzZSBpZiAocG9pbnQgPD0gMHgwN2ZmKSB7XG4gICAgICAgIHJlc3VsdFtwb3NdID0gKDB4NiA8PCA1KSB8IChwb2ludCA+PiA2KTtcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIDw8IDYpIHwgKHBvaW50ICYgMHgzZik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB3aWRlbkNoZWNrOiB7XG4gICAgICAgICAgaWYgKDB4ZDgwMCA8PSBwb2ludCkge1xuICAgICAgICAgICAgaWYgKHBvaW50IDw9IDB4ZGJmZikge1xuICAgICAgICAgICAgICBuZXh0Y29kZSA9IGVuY29kZWRTdHJpbmcuY2hhckNvZGVBdCgoaSA9IChpICsgMSkgfCAwKSkgfCAwOyAvLyBkZWZhdWx0cyB0byAwIHdoZW4gTmFOLCBjYXVzaW5nIG51bGwgcmVwbGFjZW1lbnQgY2hhcmFjdGVyXG5cbiAgICAgICAgICAgICAgaWYgKDB4ZGMwMCA8PSBuZXh0Y29kZSAmJiBuZXh0Y29kZSA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgICAgICAvL3BvaW50ID0gKChwb2ludCAtIDB4RDgwMCk8PDEwKSArIG5leHRjb2RlIC0gMHhEQzAwICsgMHgxMDAwMHwwO1xuICAgICAgICAgICAgICAgIHBvaW50ID0gKChwb2ludCA8PCAxMCkgKyBuZXh0Y29kZSAtIDB4MzVmZGMwMCkgfCAwO1xuICAgICAgICAgICAgICAgIGlmIChwb2ludCA+IDB4ZmZmZikge1xuICAgICAgICAgICAgICAgICAgcmVzdWx0W3Bvc10gPSAoMHgxZSAvKjBiMTExMTAqLyA8PCAzKSB8IChwb2ludCA+PiAxOCk7XG4gICAgICAgICAgICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAoKHBvaW50ID4+IDEyKSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICAgICAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKHBvaW50ICYgMHgzZikgLyowYjAwMTExMTExKi87XG4gICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWsgd2lkZW5DaGVjaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBwb2ludCA9IDY1NTMzIC8qMGIxMTExMTExMTExMTExMTAxKi87IC8vcmV0dXJuICdcXHhFRlxceEJGXFx4QkQnOy8vZnJvbUNoYXJDb2RlKDB4ZWYsIDB4YmYsIDB4YmQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChwb2ludCA8PSAweGRmZmYpIHtcbiAgICAgICAgICAgICAgcG9pbnQgPSA2NTUzMyAvKjBiMTExMTExMTExMTExMTEwMSovOyAvL3JldHVybiAnXFx4RUZcXHhCRlxceEJEJzsvL2Zyb21DaGFyQ29kZSgweGVmLCAweGJmLCAweGJkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCF1cGdyYWRlZGVkQXJyYXlTaXplICYmIGkgPDwgMSA8IHBvcyAmJiBpIDw8IDEgPCAoKHBvcyAtIDcpIHwgMCkpIHtcbiAgICAgICAgICAgIHVwZ3JhZGVkZWRBcnJheVNpemUgPSB0cnVlO1xuICAgICAgICAgICAgdG1wUmVzdWx0ID0gbmV3IFVpbnQ4QXJyYXkobGVuICogMyk7XG4gICAgICAgICAgICB0bXBSZXN1bHQuc2V0KHJlc3VsdCk7XG4gICAgICAgICAgICByZXN1bHQgPSB0bXBSZXN1bHQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJlc3VsdFtwb3NdID0gKDB4ZSAvKjBiMTExMCovIDw8IDQpIHwgKHBvaW50ID4+IDEyKTtcbiAgICAgICAgcmVzdWx0Wyhwb3MgPSAocG9zICsgMSkgfCAwKV0gPSAoMHgyIC8qMGIxMCovIDw8IDYpIHwgKChwb2ludCA+PiA2KSAmIDB4M2YpIC8qMGIwMDExMTExMSovO1xuICAgICAgICByZXN1bHRbKHBvcyA9IChwb3MgKyAxKSB8IDApXSA9ICgweDIgLyowYjEwKi8gPDwgNikgfCAocG9pbnQgJiAweDNmKSAvKjBiMDAxMTExMTEqLztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFVpbnQ4QXJyYXkgPyByZXN1bHQuc3ViYXJyYXkoMCwgcG9zKSA6IHJlc3VsdC5zbGljZSgwLCBwb3MpO1xuICB9XG5cbiAgcHVibGljIGVuY29kZUludG8oaW5wdXRTdHJpbmc6IHN0cmluZywgdThBcnI6IFVpbnQ4QXJyYXkpOiB7IHdyaXR0ZW46IG51bWJlcjsgcmVhZDogbnVtYmVyIH0ge1xuICAgIGNvbnN0IGVuY29kZWRTdHJpbmcgPSBpbnB1dFN0cmluZyA9PT0gdm9pZCAwID8gJycgOiAoJycgKyBpbnB1dFN0cmluZykucmVwbGFjZShlbmNvZGVyUmVnZXhwLCBlbmNvZGVyUmVwbGFjZXIpO1xuICAgIGxldCBsZW4gPSBlbmNvZGVkU3RyaW5nLmxlbmd0aCB8IDAsXG4gICAgICBpID0gMCxcbiAgICAgIGNoYXIgPSAwLFxuICAgICAgcmVhZCA9IDA7XG4gICAgY29uc3QgdThBcnJMZW4gPSB1OEFyci5sZW5ndGggfCAwO1xuICAgIGNvbnN0IGlucHV0TGVuZ3RoID0gaW5wdXRTdHJpbmcubGVuZ3RoIHwgMDtcbiAgICBpZiAodThBcnJMZW4gPCBsZW4pIGxlbiA9IHU4QXJyTGVuO1xuICAgIHB1dENoYXJzOiB7XG4gICAgICBmb3IgKDsgaSA8IGxlbjsgaSA9IChpICsgMSkgfCAwKSB7XG4gICAgICAgIGNoYXIgPSBlbmNvZGVkU3RyaW5nLmNoYXJDb2RlQXQoaSkgfCAwO1xuICAgICAgICBzd2l0Y2ggKGNoYXIgPj4gNCkge1xuICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgIGNhc2UgNjpcbiAgICAgICAgICBjYXNlIDc6XG4gICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgLy8gZXh0ZW5zaW9uIHBvaW50czpcbiAgICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgY2FzZSA5OlxuICAgICAgICAgIGNhc2UgMTA6XG4gICAgICAgICAgY2FzZSAxMTpcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgMTI6XG4gICAgICAgICAgY2FzZSAxMzpcbiAgICAgICAgICAgIGlmICgoKGkgKyAxKSB8IDApIDwgdThBcnJMZW4pIHtcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIDE0OlxuICAgICAgICAgICAgaWYgKCgoaSArIDIpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICAvL2lmICghKGNoYXIgPT09IDB4RUYgJiYgZW5jb2RlZFN0cmluZy5zdWJzdHIoaSsxfDAsMikgPT09IFwiXFx4QkZcXHhCRFwiKSlcbiAgICAgICAgICAgICAgcmVhZCA9IChyZWFkICsgMSkgfCAwO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICBjYXNlIDE1OlxuICAgICAgICAgICAgaWYgKCgoaSArIDMpIHwgMCkgPCB1OEFyckxlbikge1xuICAgICAgICAgICAgICByZWFkID0gKHJlYWQgKyAxKSB8IDA7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhayBwdXRDaGFycztcbiAgICAgICAgfVxuICAgICAgICAvL3JlYWQgPSByZWFkICsgKChjaGFyID4+IDYpICE9PSAyKSB8MDtcbiAgICAgICAgdThBcnJbaV0gPSBjaGFyO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4geyB3cml0dGVuOiBpLCByZWFkOiBpbnB1dExlbmd0aCA8IHJlYWQgPyBpbnB1dExlbmd0aCA6IHJlYWQgfTtcbiAgfVxufVxuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKHM6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICByZXR1cm4gVGV4dEVuY29kZXIucHJvdG90eXBlLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlY29kZShhOiBVaW50OEFycmF5KTogc3RyaW5nIHtcbiAgcmV0dXJuIFRleHREZWNvZGVyLnByb3RvdHlwZS5kZWNvZGUoYSk7XG59XG4iLCJpbXBvcnQgeyBUZW1wb3JhbEZhaWx1cmUgfSBmcm9tICcuL2ZhaWx1cmUnO1xuaW1wb3J0IHsgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbi8qKlxuICogVGhyb3duIGZyb20gY29kZSB0aGF0IHJlY2VpdmVzIGEgdmFsdWUgdGhhdCBpcyB1bmV4cGVjdGVkIG9yIHRoYXQgaXQncyB1bmFibGUgdG8gaGFuZGxlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ1ZhbHVlRXJyb3InKVxuZXhwb3J0IGNsYXNzIFZhbHVlRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgY2F1c2U/OiB1bmtub3duXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKipcbiAqIFRocm93biB3aGVuIGEgUGF5bG9hZCBDb252ZXJ0ZXIgaXMgbWlzY29uZmlndXJlZC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdQYXlsb2FkQ29udmVydGVyRXJyb3InKVxuZXhwb3J0IGNsYXNzIFBheWxvYWRDb252ZXJ0ZXJFcnJvciBleHRlbmRzIFZhbHVlRXJyb3Ige31cblxuLyoqXG4gKiBVc2VkIGluIGRpZmZlcmVudCBwYXJ0cyBvZiB0aGUgU0RLIHRvIG5vdGUgdGhhdCBzb21ldGhpbmcgdW5leHBlY3RlZCBoYXMgaGFwcGVuZWQuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignSWxsZWdhbFN0YXRlRXJyb3InKVxuZXhwb3J0IGNsYXNzIElsbGVnYWxTdGF0ZUVycm9yIGV4dGVuZHMgRXJyb3Ige31cblxuLyoqXG4gKiBUaGlzIGV4Y2VwdGlvbiBpcyB0aHJvd24gaW4gdGhlIGZvbGxvd2luZyBjYXNlczpcbiAqICAtIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgaXMgY3VycmVudGx5IHJ1bm5pbmdcbiAqICAtIFRoZXJlIGlzIGEgY2xvc2VkIFdvcmtmbG93IHdpdGggdGhlIHNhbWUgV29ya2Zsb3cgSWQgYW5kIHRoZSB7QGxpbmsgV29ya2Zsb3dPcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeX1cbiAqICAgIGlzIGBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURWBcbiAqICAtIFRoZXJlIGlzIGNsb3NlZCBXb3JrZmxvdyBpbiB0aGUgYENvbXBsZXRlZGAgc3RhdGUgd2l0aCB0aGUgc2FtZSBXb3JrZmxvdyBJZCBhbmQgdGhlIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dJZFJldXNlUG9saWN5fVxuICogICAgaXMgYFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFlgXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmdcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBUaHJvd24gd2hlbiBhIFdvcmtmbG93IHdpdGggdGhlIGdpdmVuIElkIGlzIG5vdCBrbm93biB0byBUZW1wb3JhbCBTZXJ2ZXIuXG4gKiBJdCBjb3VsZCBiZSBiZWNhdXNlOlxuICogLSBJZCBwYXNzZWQgaXMgaW5jb3JyZWN0XG4gKiAtIFdvcmtmbG93IGlzIGNsb3NlZCAoZm9yIHNvbWUgY2FsbHMsIGUuZy4gYHRlcm1pbmF0ZWApXG4gKiAtIFdvcmtmbG93IHdhcyBkZWxldGVkIGZyb20gdGhlIFNlcnZlciBhZnRlciByZWFjaGluZyBpdHMgcmV0ZW50aW9uIGxpbWl0XG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBXb3JrZmxvd05vdEZvdW5kRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgd29ya2Zsb3dJZDogc3RyaW5nLFxuICAgIHB1YmxpYyByZWFkb25seSBydW5JZDogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICB9XG59XG5cbi8qKlxuICogVGhyb3duIHdoZW4gdGhlIHNwZWNpZmllZCBuYW1lc3BhY2UgaXMgbm90IGtub3duIHRvIFRlbXBvcmFsIFNlcnZlci5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdOYW1lc3BhY2VOb3RGb3VuZEVycm9yJylcbmV4cG9ydCBjbGFzcyBOYW1lc3BhY2VOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgbmFtZXNwYWNlOiBzdHJpbmcpIHtcbiAgICBzdXBlcihgTmFtZXNwYWNlIG5vdCBmb3VuZDogJyR7bmFtZXNwYWNlfSdgKTtcbiAgfVxufVxuIiwiaW1wb3J0IHR5cGUgeyB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcywgZXJyb3JNZXNzYWdlLCBpc1JlY29yZCwgU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IgfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbmV4cG9ydCBjb25zdCBGQUlMVVJFX1NPVVJDRSA9ICdUeXBlU2NyaXB0U0RLJztcbmV4cG9ydCB0eXBlIFByb3RvRmFpbHVyZSA9IHRlbXBvcmFsLmFwaS5mYWlsdXJlLnYxLklGYWlsdXJlO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlXG5leHBvcnQgZW51bSBUaW1lb3V0VHlwZSB7XG4gIFRJTUVPVVRfVFlQRV9VTlNQRUNJRklFRCA9IDAsXG4gIFRJTUVPVVRfVFlQRV9TVEFSVF9UT19DTE9TRSA9IDEsXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19TVEFSVCA9IDIsXG4gIFRJTUVPVVRfVFlQRV9TQ0hFRFVMRV9UT19DTE9TRSA9IDMsXG4gIFRJTUVPVVRfVFlQRV9IRUFSVEJFQVQgPSA0LFxufVxuXG5jaGVja0V4dGVuZHM8dGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlLCBUaW1lb3V0VHlwZT4oKTtcbmNoZWNrRXh0ZW5kczxUaW1lb3V0VHlwZSwgdGVtcG9yYWwuYXBpLmVudW1zLnYxLlRpbWVvdXRUeXBlPigpO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gdGVtcG9yYWwuYXBpLmVudW1zLnYxLlJldHJ5U3RhdGVcbmV4cG9ydCBlbnVtIFJldHJ5U3RhdGUge1xuICBSRVRSWV9TVEFURV9VTlNQRUNJRklFRCA9IDAsXG4gIFJFVFJZX1NUQVRFX0lOX1BST0dSRVNTID0gMSxcbiAgUkVUUllfU1RBVEVfTk9OX1JFVFJZQUJMRV9GQUlMVVJFID0gMixcbiAgUkVUUllfU1RBVEVfVElNRU9VVCA9IDMsXG4gIFJFVFJZX1NUQVRFX01BWElNVU1fQVRURU1QVFNfUkVBQ0hFRCA9IDQsXG4gIFJFVFJZX1NUQVRFX1JFVFJZX1BPTElDWV9OT1RfU0VUID0gNSxcbiAgUkVUUllfU1RBVEVfSU5URVJOQUxfU0VSVkVSX0VSUk9SID0gNixcbiAgUkVUUllfU1RBVEVfQ0FOQ0VMX1JFUVVFU1RFRCA9IDcsXG59XG5cbmNoZWNrRXh0ZW5kczx0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZSwgUmV0cnlTdGF0ZT4oKTtcbmNoZWNrRXh0ZW5kczxSZXRyeVN0YXRlLCB0ZW1wb3JhbC5hcGkuZW51bXMudjEuUmV0cnlTdGF0ZT4oKTtcblxuZXhwb3J0IHR5cGUgV29ya2Zsb3dFeGVjdXRpb24gPSB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklXb3JrZmxvd0V4ZWN1dGlvbjtcblxuLyoqXG4gKiBSZXByZXNlbnRzIGZhaWx1cmVzIHRoYXQgY2FuIGNyb3NzIFdvcmtmbG93IGFuZCBBY3Rpdml0eSBib3VuZGFyaWVzLlxuICpcbiAqICoqTmV2ZXIgZXh0ZW5kIHRoaXMgY2xhc3Mgb3IgYW55IG9mIGl0cyBjaGlsZHJlbi4qKlxuICpcbiAqIFRoZSBvbmx5IGNoaWxkIGNsYXNzIHlvdSBzaG91bGQgZXZlciB0aHJvdyBmcm9tIHlvdXIgY29kZSBpcyB7QGxpbmsgQXBwbGljYXRpb25GYWlsdXJlfS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZW1wb3JhbEZhaWx1cmUnKVxuZXhwb3J0IGNsYXNzIFRlbXBvcmFsRmFpbHVyZSBleHRlbmRzIEVycm9yIHtcbiAgLyoqXG4gICAqIFRoZSBvcmlnaW5hbCBmYWlsdXJlIHRoYXQgY29uc3RydWN0ZWQgdGhpcyBlcnJvci5cbiAgICpcbiAgICogT25seSBwcmVzZW50IGlmIHRoaXMgZXJyb3Igd2FzIGdlbmVyYXRlZCBmcm9tIGFuIGV4dGVybmFsIG9wZXJhdGlvbi5cbiAgICovXG4gIHB1YmxpYyBmYWlsdXJlPzogUHJvdG9GYWlsdXJlO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UgPz8gdW5kZWZpbmVkKTtcbiAgfVxufVxuXG4vKiogRXhjZXB0aW9ucyBvcmlnaW5hdGVkIGF0IHRoZSBUZW1wb3JhbCBzZXJ2aWNlLiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdTZXJ2ZXJGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBTZXJ2ZXJGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU6IGJvb2xlYW4sXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYHMgYXJlIHVzZWQgdG8gY29tbXVuaWNhdGUgYXBwbGljYXRpb24tc3BlY2lmaWMgZmFpbHVyZXMgaW4gV29ya2Zsb3dzIGFuZCBBY3Rpdml0aWVzLlxuICpcbiAqIFRoZSB7QGxpbmsgdHlwZX0gcHJvcGVydHkgaXMgbWF0Y2hlZCBhZ2FpbnN0IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSB0byBkZXRlcm1pbmUgaWYgYW4gaW5zdGFuY2VcbiAqIG9mIHRoaXMgZXJyb3IgaXMgcmV0cnlhYmxlLiBBbm90aGVyIHdheSB0byBhdm9pZCByZXRyeWluZyBpcyBieSBzZXR0aW5nIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHRvIGB0cnVlYC5cbiAqXG4gKiBJbiBXb3JrZmxvd3MsIGlmIHlvdSB0aHJvdyBhIG5vbi1gQXBwbGljYXRpb25GYWlsdXJlYCwgdGhlIFdvcmtmbG93IFRhc2sgd2lsbCBmYWlsIGFuZCBiZSByZXRyaWVkLiBJZiB5b3UgdGhyb3cgYW5cbiAqIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIHdpbGwgZmFpbC5cbiAqXG4gKiBJbiBBY3Rpdml0aWVzLCB5b3UgY2FuIGVpdGhlciB0aHJvdyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCBvciBhbm90aGVyIGBFcnJvcmAgdG8gZmFpbCB0aGUgQWN0aXZpdHkgVGFzay4gSW4gdGhlXG4gKiBsYXR0ZXIgY2FzZSwgdGhlIGBFcnJvcmAgd2lsbCBiZSBjb252ZXJ0ZWQgdG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAuIFRoZSBjb252ZXJzaW9uIGlzIGRvbmUgYXMgZm9sbG93aW5nOlxuICpcbiAqIC0gYHR5cGVgIGlzIHNldCB0byBgZXJyb3IuY29uc3RydWN0b3I/Lm5hbWUgPz8gZXJyb3IubmFtZWBcbiAqIC0gYG1lc3NhZ2VgIGlzIHNldCB0byBgZXJyb3IubWVzc2FnZWBcbiAqIC0gYG5vblJldHJ5YWJsZWAgaXMgc2V0IHRvIGZhbHNlXG4gKiAtIGBkZXRhaWxzYCBhcmUgc2V0IHRvIG51bGxcbiAqIC0gc3RhY2sgdHJhY2UgaXMgY29waWVkIGZyb20gdGhlIG9yaWdpbmFsIGVycm9yXG4gKlxuICogV2hlbiBhbiB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2NvbmNlcHRzL3doYXQtaXMtYW4tYWN0aXZpdHktZXhlY3V0aW9uIHwgQWN0aXZpdHkgRXhlY3V0aW9ufSBmYWlscywgdGhlXG4gKiBgQXBwbGljYXRpb25GYWlsdXJlYCBmcm9tIHRoZSBsYXN0IEFjdGl2aXR5IFRhc2sgd2lsbCBiZSB0aGUgYGNhdXNlYCBvZiB0aGUge0BsaW5rIEFjdGl2aXR5RmFpbHVyZX0gdGhyb3duIGluIHRoZVxuICogV29ya2Zsb3cuXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignQXBwbGljYXRpb25GYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICAvKipcbiAgICogQWx0ZXJuYXRpdmVseSwgdXNlIHtAbGluayBmcm9tRXJyb3J9IG9yIHtAbGluayBjcmVhdGV9LlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZT86IHN0cmluZyB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgcHVibGljIHJlYWRvbmx5IHR5cGU/OiBzdHJpbmcgfCB1bmRlZmluZWQgfCBudWxsLFxuICAgIHB1YmxpYyByZWFkb25seSBub25SZXRyeWFibGU/OiBib29sZWFuIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgZGV0YWlscz86IHVua25vd25bXSB8IHVuZGVmaW5lZCB8IG51bGwsXG4gICAgY2F1c2U/OiBFcnJvclxuICApIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBBcHBsaWNhdGlvbkZhaWx1cmVgIGZyb20gYW4gRXJyb3Igb2JqZWN0LlxuICAgKlxuICAgKiBGaXJzdCBjYWxscyB7QGxpbmsgZW5zdXJlQXBwbGljYXRpb25GYWlsdXJlIHwgYGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnJvcilgfSBhbmQgdGhlbiBvdmVycmlkZXMgYW55IGZpZWxkc1xuICAgKiBwcm92aWRlZCBpbiBgb3ZlcnJpZGVzYC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgZnJvbUVycm9yKGVycm9yOiBFcnJvciB8IHVua25vd24sIG92ZXJyaWRlcz86IEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIGNvbnN0IGZhaWx1cmUgPSBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3IpO1xuICAgIE9iamVjdC5hc3NpZ24oZmFpbHVyZSwgb3ZlcnJpZGVzKTtcbiAgICByZXR1cm4gZmFpbHVyZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAuXG4gICAqXG4gICAqIEJ5IGRlZmF1bHQsIHdpbGwgYmUgcmV0cnlhYmxlICh1bmxlc3MgaXRzIGB0eXBlYCBpcyBpbmNsdWRlZCBpbiB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBjcmVhdGUob3B0aW9uczogQXBwbGljYXRpb25GYWlsdXJlT3B0aW9ucyk6IEFwcGxpY2F0aW9uRmFpbHVyZSB7XG4gICAgY29uc3QgeyBtZXNzYWdlLCB0eXBlLCBub25SZXRyeWFibGUgPSBmYWxzZSwgZGV0YWlscywgY2F1c2UgfSA9IG9wdGlvbnM7XG4gICAgcmV0dXJuIG5ldyB0aGlzKG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZSwgZGV0YWlscywgY2F1c2UpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCBhIG5ldyBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIHRoZSB7QGxpbmsgbm9uUmV0cnlhYmxlfSBmbGFnIHNldCB0byBmYWxzZS4gTm90ZSB0aGF0IHRoaXMgZXJyb3Igd2lsbCBzdGlsbFxuICAgKiBub3QgYmUgcmV0cmllZCBpZiBpdHMgYHR5cGVgIGlzIGluY2x1ZGVkIGluIHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlICh1c2VkIGJ5IHtAbGluayBSZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzfSlcbiAgICogQHBhcmFtIGRldGFpbHMgT3B0aW9uYWwgZGV0YWlscyBhYm91dCB0aGUgZmFpbHVyZS4gU2VyaWFsaXplZCBieSB0aGUgV29ya2VyJ3Mge0BsaW5rIFBheWxvYWRDb252ZXJ0ZXJ9LlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyByZXRyeWFibGUobWVzc2FnZT86IHN0cmluZyB8IG51bGwsIHR5cGU/OiBzdHJpbmcgfCBudWxsLCAuLi5kZXRhaWxzOiB1bmtub3duW10pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICAgIHJldHVybiBuZXcgdGhpcyhtZXNzYWdlLCB0eXBlID8/ICdFcnJvcicsIGZhbHNlLCBkZXRhaWxzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgYSBuZXcgYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aCB0aGUge0BsaW5rIG5vblJldHJ5YWJsZX0gZmxhZyBzZXQgdG8gdHJ1ZS5cbiAgICpcbiAgICogV2hlbiB0aHJvd24gZnJvbSBhbiBBY3Rpdml0eSBvciBXb3JrZmxvdywgdGhlIEFjdGl2aXR5IG9yIFdvcmtmbG93IHdpbGwgbm90IGJlIHJldHJpZWQgKGV2ZW4gaWYgYHR5cGVgIGlzIG5vdFxuICAgKiBsaXN0ZWQgaW4ge0BsaW5rIFJldHJ5UG9saWN5Lm5vblJldHJ5YWJsZUVycm9yVHlwZXN9KS5cbiAgICpcbiAgICogQHBhcmFtIG1lc3NhZ2UgT3B0aW9uYWwgZXJyb3IgbWVzc2FnZVxuICAgKiBAcGFyYW0gdHlwZSBPcHRpb25hbCBlcnJvciB0eXBlXG4gICAqIEBwYXJhbSBkZXRhaWxzIE9wdGlvbmFsIGRldGFpbHMgYWJvdXQgdGhlIGZhaWx1cmUuIFNlcmlhbGl6ZWQgYnkgdGhlIFdvcmtlcidzIHtAbGluayBQYXlsb2FkQ29udmVydGVyfS5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgbm9uUmV0cnlhYmxlKG1lc3NhZ2U/OiBzdHJpbmcgfCBudWxsLCB0eXBlPzogc3RyaW5nIHwgbnVsbCwgLi4uZGV0YWlsczogdW5rbm93bltdKTogQXBwbGljYXRpb25GYWlsdXJlIHtcbiAgICByZXR1cm4gbmV3IHRoaXMobWVzc2FnZSwgdHlwZSA/PyAnRXJyb3InLCB0cnVlLCBkZXRhaWxzKTtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uRmFpbHVyZU9wdGlvbnMge1xuICAvKipcbiAgICogRXJyb3IgbWVzc2FnZVxuICAgKi9cbiAgbWVzc2FnZT86IHN0cmluZztcblxuICAvKipcbiAgICogRXJyb3IgdHlwZSAodXNlZCBieSB7QGxpbmsgUmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlc30pXG4gICAqL1xuICB0eXBlPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBjdXJyZW50IEFjdGl2aXR5IG9yIFdvcmtmbG93IGNhbiBiZSByZXRyaWVkXG4gICAqXG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBub25SZXRyeWFibGU/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBEZXRhaWxzIGFib3V0IHRoZSBmYWlsdXJlLiBTZXJpYWxpemVkIGJ5IHRoZSBXb3JrZXIncyB7QGxpbmsgUGF5bG9hZENvbnZlcnRlcn0uXG4gICAqL1xuICBkZXRhaWxzPzogdW5rbm93bltdO1xuXG4gIC8qKlxuICAgKiBDYXVzZSBvZiB0aGUgZmFpbHVyZVxuICAgKi9cbiAgY2F1c2U/OiBFcnJvcjtcbn1cblxuLyoqXG4gKiBUaGlzIGVycm9yIGlzIHRocm93biB3aGVuIENhbmNlbGxhdGlvbiBoYXMgYmVlbiByZXF1ZXN0ZWQuIFRvIGFsbG93IENhbmNlbGxhdGlvbiB0byBoYXBwZW4sIGxldCBpdCBwcm9wYWdhdGUuIFRvXG4gKiBpZ25vcmUgQ2FuY2VsbGF0aW9uLCBjYXRjaCBpdCBhbmQgY29udGludWUgZXhlY3V0aW5nLiBOb3RlIHRoYXQgQ2FuY2VsbGF0aW9uIGNhbiBvbmx5IGJlIHJlcXVlc3RlZCBhIHNpbmdsZSB0aW1lLCBzb1xuICogeW91ciBXb3JrZmxvdy9BY3Rpdml0eSBFeGVjdXRpb24gd2lsbCBub3QgcmVjZWl2ZSBmdXJ0aGVyIENhbmNlbGxhdGlvbiByZXF1ZXN0cy5cbiAqXG4gKiBXaGVuIGEgV29ya2Zsb3cgb3IgQWN0aXZpdHkgaGFzIGJlZW4gc3VjY2Vzc2Z1bGx5IGNhbmNlbGxlZCwgYSBgQ2FuY2VsbGVkRmFpbHVyZWAgd2lsbCBiZSB0aGUgYGNhdXNlYC5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDYW5jZWxsZWRGYWlsdXJlJylcbmV4cG9ydCBjbGFzcyBDYW5jZWxsZWRGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgY29uc3RydWN0b3IoXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBkZXRhaWxzOiB1bmtub3duW10gPSBbXSxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIFVzZWQgYXMgdGhlIGBjYXVzZWAgd2hlbiBhIFdvcmtmbG93IGhhcyBiZWVuIHRlcm1pbmF0ZWRcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUZXJtaW5hdGVkRmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGVybWluYXRlZEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsIGNhdXNlPzogRXJyb3IpIHtcbiAgICBzdXBlcihtZXNzYWdlLCBjYXVzZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBVc2VkIHRvIHJlcHJlc2VudCB0aW1lb3V0cyBvZiBBY3Rpdml0aWVzIGFuZCBXb3JrZmxvd3NcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdUaW1lb3V0RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgVGltZW91dEZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBjb25zdHJ1Y3RvcihcbiAgICBtZXNzYWdlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gICAgcHVibGljIHJlYWRvbmx5IGxhc3RIZWFydGJlYXREZXRhaWxzOiB1bmtub3duLFxuICAgIHB1YmxpYyByZWFkb25seSB0aW1lb3V0VHlwZTogVGltZW91dFR5cGVcbiAgKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBDb250YWlucyBpbmZvcm1hdGlvbiBhYm91dCBhbiBBY3Rpdml0eSBmYWlsdXJlLiBBbHdheXMgY29udGFpbnMgdGhlIG9yaWdpbmFsIHJlYXNvbiBmb3IgdGhlIGZhaWx1cmUgYXMgaXRzIGBjYXVzZWAuXG4gKiBGb3IgZXhhbXBsZSwgaWYgYW4gQWN0aXZpdHkgdGltZWQgb3V0LCB0aGUgY2F1c2Ugd2lsbCBiZSBhIHtAbGluayBUaW1lb3V0RmFpbHVyZX0uXG4gKlxuICogVGhpcyBleGNlcHRpb24gaXMgZXhwZWN0ZWQgdG8gYmUgdGhyb3duIG9ubHkgYnkgdGhlIGZyYW1ld29yayBjb2RlLlxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0FjdGl2aXR5RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQWN0aXZpdHlGYWlsdXJlIGV4dGVuZHMgVGVtcG9yYWxGYWlsdXJlIHtcbiAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgYWN0aXZpdHlUeXBlOiBzdHJpbmcsXG4gICAgcHVibGljIHJlYWRvbmx5IGFjdGl2aXR5SWQ6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmV0cnlTdGF0ZTogUmV0cnlTdGF0ZSxcbiAgICBwdWJsaWMgcmVhZG9ubHkgaWRlbnRpdHk6IHN0cmluZyB8IHVuZGVmaW5lZCxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKG1lc3NhZ2UsIGNhdXNlKTtcbiAgfVxufVxuXG4vKipcbiAqIENvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IGEgQ2hpbGQgV29ya2Zsb3cgZmFpbHVyZS4gQWx3YXlzIGNvbnRhaW5zIHRoZSByZWFzb24gZm9yIHRoZSBmYWlsdXJlIGFzIGl0cyB7QGxpbmsgY2F1c2V9LlxuICogRm9yIGV4YW1wbGUsIGlmIHRoZSBDaGlsZCB3YXMgVGVybWluYXRlZCwgdGhlIGBjYXVzZWAgaXMgYSB7QGxpbmsgVGVybWluYXRlZEZhaWx1cmV9LlxuICpcbiAqIFRoaXMgZXhjZXB0aW9uIGlzIGV4cGVjdGVkIHRvIGJlIHRocm93biBvbmx5IGJ5IHRoZSBmcmFtZXdvcmsgY29kZS5cbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdDaGlsZFdvcmtmbG93RmFpbHVyZScpXG5leHBvcnQgY2xhc3MgQ2hpbGRXb3JrZmxvd0ZhaWx1cmUgZXh0ZW5kcyBUZW1wb3JhbEZhaWx1cmUge1xuICBwdWJsaWMgY29uc3RydWN0b3IoXG4gICAgcHVibGljIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuICAgIHB1YmxpYyByZWFkb25seSBleGVjdXRpb246IFdvcmtmbG93RXhlY3V0aW9uLFxuICAgIHB1YmxpYyByZWFkb25seSB3b3JrZmxvd1R5cGU6IHN0cmluZyxcbiAgICBwdWJsaWMgcmVhZG9ubHkgcmV0cnlTdGF0ZTogUmV0cnlTdGF0ZSxcbiAgICBjYXVzZT86IEVycm9yXG4gICkge1xuICAgIHN1cGVyKCdDaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gZmFpbGVkJywgY2F1c2UpO1xuICB9XG59XG5cbi8qKlxuICogSWYgYGVycm9yYCBpcyBhbHJlYWR5IGFuIGBBcHBsaWNhdGlvbkZhaWx1cmVgLCByZXR1cm5zIGBlcnJvcmAuXG4gKlxuICogT3RoZXJ3aXNlLCBjb252ZXJ0cyBgZXJyb3JgIGludG8gYW4gYEFwcGxpY2F0aW9uRmFpbHVyZWAgd2l0aDpcbiAqXG4gKiAtIGBtZXNzYWdlYDogYGVycm9yLm1lc3NhZ2VgIG9yIGBTdHJpbmcoZXJyb3IpYFxuICogLSBgdHlwZWA6IGBlcnJvci5jb25zdHJ1Y3Rvci5uYW1lYCBvciBgZXJyb3IubmFtZWBcbiAqIC0gYHN0YWNrYDogYGVycm9yLnN0YWNrYCBvciBgJydgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVBcHBsaWNhdGlvbkZhaWx1cmUoZXJyb3I6IHVua25vd24pOiBBcHBsaWNhdGlvbkZhaWx1cmUge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBBcHBsaWNhdGlvbkZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyb3I7XG4gIH1cblxuICBjb25zdCBtZXNzYWdlID0gKGlzUmVjb3JkKGVycm9yKSAmJiBTdHJpbmcoZXJyb3IubWVzc2FnZSkpIHx8IFN0cmluZyhlcnJvcik7XG4gIGNvbnN0IHR5cGUgPSAoaXNSZWNvcmQoZXJyb3IpICYmIChlcnJvci5jb25zdHJ1Y3Rvcj8ubmFtZSA/PyBlcnJvci5uYW1lKSkgfHwgdW5kZWZpbmVkO1xuICBjb25zdCBmYWlsdXJlID0gQXBwbGljYXRpb25GYWlsdXJlLmNyZWF0ZSh7IG1lc3NhZ2UsIHR5cGUsIG5vblJldHJ5YWJsZTogZmFsc2UgfSk7XG4gIGZhaWx1cmUuc3RhY2sgPSAoaXNSZWNvcmQoZXJyb3IpICYmIFN0cmluZyhlcnJvci5zdGFjaykpIHx8ICcnO1xuICByZXR1cm4gZmFpbHVyZTtcbn1cblxuLyoqXG4gKiBJZiBgZXJyYCBpcyBhbiBFcnJvciBpdCBpcyB0dXJuZWQgaW50byBhbiBgQXBwbGljYXRpb25GYWlsdXJlYC5cbiAqXG4gKiBJZiBgZXJyYCB3YXMgYWxyZWFkeSBhIGBUZW1wb3JhbEZhaWx1cmVgLCByZXR1cm5zIHRoZSBvcmlnaW5hbCBlcnJvci5cbiAqXG4gKiBPdGhlcndpc2UgcmV0dXJucyBhbiBgQXBwbGljYXRpb25GYWlsdXJlYCB3aXRoIGBTdHJpbmcoZXJyKWAgYXMgdGhlIG1lc3NhZ2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyOiB1bmtub3duKTogVGVtcG9yYWxGYWlsdXJlIHtcbiAgaWYgKGVyciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkge1xuICAgIHJldHVybiBlcnI7XG4gIH1cbiAgcmV0dXJuIGVuc3VyZUFwcGxpY2F0aW9uRmFpbHVyZShlcnIpO1xufVxuXG4vKipcbiAqIEdldCB0aGUgcm9vdCBjYXVzZSBtZXNzYWdlIG9mIGdpdmVuIGBlcnJvcmAuXG4gKlxuICogSW4gY2FzZSBgZXJyb3JgIGlzIGEge0BsaW5rIFRlbXBvcmFsRmFpbHVyZX0sIHJlY3Vyc2UgdGhlIGBjYXVzZWAgY2hhaW4gYW5kIHJldHVybiB0aGUgcm9vdCBgY2F1c2UubWVzc2FnZWAuXG4gKiBPdGhlcndpc2UsIHJldHVybiBgZXJyb3IubWVzc2FnZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb290Q2F1c2UoZXJyb3I6IHVua25vd24pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICBpZiAoZXJyb3IgaW5zdGFuY2VvZiBUZW1wb3JhbEZhaWx1cmUpIHtcbiAgICByZXR1cm4gZXJyb3IuY2F1c2UgPyByb290Q2F1c2UoZXJyb3IuY2F1c2UpIDogZXJyb3IubWVzc2FnZTtcbiAgfVxuICByZXR1cm4gZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cbiIsIi8qKlxuICogQ29tbW9uIGxpYnJhcnkgZm9yIGNvZGUgdGhhdCdzIHVzZWQgYWNyb3NzIHRoZSBDbGllbnQsIFdvcmtlciwgYW5kL29yIFdvcmtmbG93XG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCAqIGFzIGVuY29kaW5nIGZyb20gJy4vZW5jb2RpbmcnO1xuaW1wb3J0ICogYXMgaGVscGVycyBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5cbmV4cG9ydCAqIGZyb20gJy4vYWN0aXZpdHktb3B0aW9ucyc7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9kYXRhLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9mYWlsdXJlLWNvbnZlcnRlcic7XG5leHBvcnQgKiBmcm9tICcuL2NvbnZlcnRlci9wYXlsb2FkLWNvZGVjJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3BheWxvYWQtY29udmVydGVyJztcbmV4cG9ydCAqIGZyb20gJy4vY29udmVydGVyL3R5cGVzJztcbmV4cG9ydCAqIGZyb20gJy4vZGVwcmVjYXRlZC10aW1lJztcbmV4cG9ydCAqIGZyb20gJy4vZXJyb3JzJztcbmV4cG9ydCAqIGZyb20gJy4vZmFpbHVyZSc7XG5leHBvcnQgeyBIZWFkZXJzLCBOZXh0IH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmZhY2VzJztcbmV4cG9ydCAqIGZyb20gJy4vbG9nZ2VyJztcbmV4cG9ydCAqIGZyb20gJy4vcmV0cnktcG9saWN5JztcbmV4cG9ydCB0eXBlIHsgVGltZXN0YW1wLCBEdXJhdGlvbiwgU3RyaW5nVmFsdWUgfSBmcm9tICcuL3RpbWUnO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdy1vcHRpb25zJztcbmV4cG9ydCAqIGZyb20gJy4vdmVyc2lvbmluZy1pbnRlbnQnO1xuXG4vKipcbiAqIEVuY29kZSBhIFVURi04IHN0cmluZyBpbnRvIGEgVWludDhBcnJheVxuICpcbiAqIEBoaWRkZW5cbiAqIEBkZXByZWNhdGVkIC0gbWVhbnQgZm9yIGludGVybmFsIHVzZSBvbmx5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1OChzOiBzdHJpbmcpOiBVaW50OEFycmF5IHtcbiAgcmV0dXJuIGVuY29kaW5nLmVuY29kZShzKTtcbn1cblxuLyoqXG4gKiBEZWNvZGUgYSBVaW50OEFycmF5IGludG8gYSBVVEYtOCBzdHJpbmdcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGFycjogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIHJldHVybiBlbmNvZGluZy5kZWNvZGUoYXJyKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLm1lc3NhZ2VgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JNZXNzYWdlKGVycm9yKTtcbn1cblxuLyoqXG4gKiBHZXQgYGVycm9yLmNvZGVgIChvciBgdW5kZWZpbmVkYCBpZiBub3QgcHJlc2VudClcbiAqXG4gKiBAaGlkZGVuXG4gKiBAZGVwcmVjYXRlZCAtIG1lYW50IGZvciBpbnRlcm5hbCB1c2Ugb25seVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgcmV0dXJuIGhlbHBlcnMuZXJyb3JDb2RlKGVycm9yKTtcbn1cbiIsImltcG9ydCB7IEFueUZ1bmMsIE9taXRMYXN0UGFyYW0gfSBmcm9tICcuL3R5cGUtaGVscGVycyc7XG5pbXBvcnQgeyBQYXlsb2FkIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuLyoqXG4gKiBUeXBlIG9mIHRoZSBuZXh0IGZ1bmN0aW9uIGZvciBhIGdpdmVuIGludGVyY2VwdG9yIGZ1bmN0aW9uXG4gKlxuICogQ2FsbGVkIGZyb20gYW4gaW50ZXJjZXB0b3IgdG8gY29udGludWUgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG5leHBvcnQgdHlwZSBOZXh0PElGLCBGTiBleHRlbmRzIGtleW9mIElGPiA9IFJlcXVpcmVkPElGPltGTl0gZXh0ZW5kcyBBbnlGdW5jID8gT21pdExhc3RQYXJhbTxSZXF1aXJlZDxJRj5bRk5dPiA6IG5ldmVyO1xuXG4vKiogSGVhZGVycyBhcmUganVzdCBhIG1hcHBpbmcgb2YgaGVhZGVyIG5hbWUgdG8gUGF5bG9hZCAqL1xuZXhwb3J0IHR5cGUgSGVhZGVycyA9IFJlY29yZDxzdHJpbmcsIFBheWxvYWQ+O1xuXG4vKipcbiAqIENvbXBvc2UgYWxsIGludGVyY2VwdG9yIG1ldGhvZHMgaW50byBhIHNpbmdsZSBmdW5jdGlvbi5cbiAqXG4gKiBDYWxsaW5nIHRoZSBjb21wb3NlZCBmdW5jdGlvbiByZXN1bHRzIGluIGNhbGxpbmcgZWFjaCBvZiB0aGUgcHJvdmlkZWQgaW50ZXJjZXB0b3IsIGluIG9yZGVyIChmcm9tIHRoZSBmaXJzdCB0b1xuICogdGhlIGxhc3QpLCBmb2xsb3dlZCBieSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24gcHJvdmlkZWQgYXMgYXJndW1lbnQgdG8gYGNvbXBvc2VJbnRlcmNlcHRvcnMoKWAuXG4gKlxuICogQHBhcmFtIGludGVyY2VwdG9ycyBhIGxpc3Qgb2YgaW50ZXJjZXB0b3JzXG4gKiBAcGFyYW0gbWV0aG9kIHRoZSBuYW1lIG9mIHRoZSBpbnRlcmNlcHRvciBtZXRob2QgdG8gY29tcG9zZVxuICogQHBhcmFtIG5leHQgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uIHRvIGJlIGV4ZWN1dGVkIGF0IHRoZSBlbmQgb2YgdGhlIGludGVyY2VwdGlvbiBjaGFpblxuICovXG4vLyB0cy1wcnVuZS1pZ25vcmUtbmV4dCAoaW1wb3J0ZWQgdmlhIGxpYi9pbnRlcmNlcHRvcnMpXG5leHBvcnQgZnVuY3Rpb24gY29tcG9zZUludGVyY2VwdG9yczxJLCBNIGV4dGVuZHMga2V5b2YgST4oaW50ZXJjZXB0b3JzOiBJW10sIG1ldGhvZDogTSwgbmV4dDogTmV4dDxJLCBNPik6IE5leHQ8SSwgTT4ge1xuICBmb3IgKGxldCBpID0gaW50ZXJjZXB0b3JzLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgY29uc3QgaW50ZXJjZXB0b3IgPSBpbnRlcmNlcHRvcnNbaV07XG4gICAgaWYgKGludGVyY2VwdG9yW21ldGhvZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcHJldiA9IG5leHQ7XG4gICAgICAvLyBXZSBsb3NlIHR5cGUgc2FmZXR5IGhlcmUgYmVjYXVzZSBUeXBlc2NyaXB0IGNhbid0IGRlZHVjZSB0aGF0IGludGVyY2VwdG9yW21ldGhvZF0gaXMgYSBmdW5jdGlvbiB0aGF0IHJldHVybnNcbiAgICAgIC8vIHRoZSBzYW1lIHR5cGUgYXMgTmV4dDxJLCBNPlxuICAgICAgbmV4dCA9ICgoaW5wdXQ6IGFueSkgPT4gKGludGVyY2VwdG9yW21ldGhvZF0gYXMgYW55KShpbnB1dCwgcHJldikpIGFzIGFueTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5leHQ7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG5leHBvcnQgdHlwZSBQYXlsb2FkID0gdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUGF5bG9hZDtcblxuLyoqIFR5cGUgdGhhdCBjYW4gYmUgcmV0dXJuZWQgZnJvbSBhIFdvcmtmbG93IGBleGVjdXRlYCBmdW5jdGlvbiAqL1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dSZXR1cm5UeXBlID0gUHJvbWlzZTxhbnk+O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dVcGRhdGVUeXBlID0gKC4uLmFyZ3M6IGFueVtdKSA9PiBQcm9taXNlPGFueT4gfCBhbnk7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGUgPSB7XG4gIGhhbmRsZXI6IFdvcmtmbG93VXBkYXRlVHlwZTtcbiAgdmFsaWRhdG9yPzogV29ya2Zsb3dVcGRhdGVWYWxpZGF0b3JUeXBlO1xuICBkZXNjcmlwdGlvbj86IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBXb3JrZmxvd1NpZ25hbFR5cGUgPSAoLi4uYXJnczogYW55W10pID0+IFByb21pc2U8dm9pZD4gfCB2b2lkO1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlID0geyBoYW5kbGVyOiBXb3JrZmxvd1NpZ25hbFR5cGU7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5leHBvcnQgdHlwZSBXb3JrZmxvd1F1ZXJ5VHlwZSA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuZXhwb3J0IHR5cGUgV29ya2Zsb3dRdWVyeUFubm90YXRlZFR5cGUgPSB7IGhhbmRsZXI6IFdvcmtmbG93UXVlcnlUeXBlOyBkZXNjcmlwdGlvbj86IHN0cmluZyB9O1xuXG4vKipcbiAqIEJyb2FkIFdvcmtmbG93IGZ1bmN0aW9uIGRlZmluaXRpb24sIHNwZWNpZmljIFdvcmtmbG93cyB3aWxsIHR5cGljYWxseSB1c2UgYSBuYXJyb3dlciB0eXBlIGRlZmluaXRpb24sIGUuZzpcbiAqIGBgYHRzXG4gKiBleHBvcnQgYXN5bmMgZnVuY3Rpb24gbXlXb3JrZmxvdyhhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvdyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gV29ya2Zsb3dSZXR1cm5UeXBlO1xuXG5kZWNsYXJlIGNvbnN0IGFyZ3NCcmFuZDogdW5pcXVlIHN5bWJvbDtcbmRlY2xhcmUgY29uc3QgcmV0QnJhbmQ6IHVuaXF1ZSBzeW1ib2w7XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHVwZGF0ZSBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVVcGRhdGV9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSB1cGRhdGUgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3VwZGF0ZSc7XG4gIG5hbWU6IE5hbWU7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCBhcmdzLlxuICAgKiBUaGlzIGZpZWxkIGlzIG5vdCBwcmVzZW50IGF0IHJ1bi10aW1lLlxuICAgKi9cbiAgW2FyZ3NCcmFuZF06IEFyZ3M7XG4gIC8qKlxuICAgKiBWaXJ0dWFsIHR5cGUgYnJhbmQgdG8gbWFpbnRhaW4gYSBkaXN0aW5jdGlvbiBiZXR3ZWVuIHtAbGluayBVcGRhdGVEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCByZXR1cm4gdHlwZXMuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbcmV0QnJhbmRdOiBSZXQ7XG59XG5cbi8qKlxuICogQW4gaW50ZXJmYWNlIHJlcHJlc2VudGluZyBhIFdvcmtmbG93IHNpZ25hbCBkZWZpbml0aW9uLCBhcyByZXR1cm5lZCBmcm9tIHtAbGluayBkZWZpbmVTaWduYWx9XG4gKlxuICogQHJlbWFya3MgYEFyZ3NgIGNhbiBiZSB1c2VkIGZvciBwYXJhbWV0ZXIgdHlwZSBpbmZlcmVuY2UgaW4gaGFuZGxlciBmdW5jdGlvbnMgYW5kIFdvcmtmbG93SGFuZGxlIG1ldGhvZHMuXG4gKiBgTmFtZWAgY2FuIG9wdGlvbmFsbHkgYmUgc3BlY2lmaWVkIHdpdGggYSBzdHJpbmcgbGl0ZXJhbCB0eXBlIHRvIHByZXNlcnZlIHR5cGUtbGV2ZWwga25vd2xlZGdlIG9mIHRoZSBzaWduYWwgbmFtZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxEZWZpbml0aW9uPEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPiB7XG4gIHR5cGU6ICdzaWduYWwnO1xuICBuYW1lOiBOYW1lO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xufVxuXG4vKipcbiAqIEFuIGludGVyZmFjZSByZXByZXNlbnRpbmcgYSBXb3JrZmxvdyBxdWVyeSBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVF1ZXJ5fVxuICpcbiAqIEByZW1hcmtzIGBBcmdzYCBhbmQgYFJldGAgY2FuIGJlIHVzZWQgZm9yIHBhcmFtZXRlciB0eXBlIGluZmVyZW5jZSBpbiBoYW5kbGVyIGZ1bmN0aW9ucyBhbmQgV29ya2Zsb3dIYW5kbGUgbWV0aG9kcy5cbiAqIGBOYW1lYCBjYW4gb3B0aW9uYWxseSBiZSBzcGVjaWZpZWQgd2l0aCBhIHN0cmluZyBsaXRlcmFsIHR5cGUgdG8gcHJlc2VydmUgdHlwZS1sZXZlbCBrbm93bGVkZ2Ugb2YgdGhlIHF1ZXJ5IG5hbWUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+IHtcbiAgdHlwZTogJ3F1ZXJ5JztcbiAgbmFtZTogTmFtZTtcbiAgLyoqXG4gICAqIFZpcnR1YWwgdHlwZSBicmFuZCB0byBtYWludGFpbiBhIGRpc3RpbmN0aW9uIGJldHdlZW4ge0BsaW5rIFF1ZXJ5RGVmaW5pdGlvbn0gdHlwZXMgd2l0aCBkaWZmZXJlbnQgYXJncy5cbiAgICogVGhpcyBmaWVsZCBpcyBub3QgcHJlc2VudCBhdCBydW4tdGltZS5cbiAgICovXG4gIFthcmdzQnJhbmRdOiBBcmdzO1xuICAvKipcbiAgICogVmlydHVhbCB0eXBlIGJyYW5kIHRvIG1haW50YWluIGEgZGlzdGluY3Rpb24gYmV0d2VlbiB7QGxpbmsgUXVlcnlEZWZpbml0aW9ufSB0eXBlcyB3aXRoIGRpZmZlcmVudCByZXR1cm4gdHlwZXMuXG4gICAqIFRoaXMgZmllbGQgaXMgbm90IHByZXNlbnQgYXQgcnVuLXRpbWUuXG4gICAqL1xuICBbcmV0QnJhbmRdOiBSZXQ7XG59XG5cbi8qKiBHZXQgdGhlIFwidW53cmFwcGVkXCIgcmV0dXJuIHR5cGUgKHdpdGhvdXQgUHJvbWlzZSkgb2YgdGhlIGV4ZWN1dGUgaGFuZGxlciBmcm9tIFdvcmtmbG93IHR5cGUgYFdgICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd1Jlc3VsdFR5cGU8VyBleHRlbmRzIFdvcmtmbG93PiA9IFJldHVyblR5cGU8Vz4gZXh0ZW5kcyBQcm9taXNlPGluZmVyIFI+ID8gUiA6IG5ldmVyO1xuXG4vKipcbiAqIElmIGFub3RoZXIgU0RLIGNyZWF0ZXMgYSBTZWFyY2ggQXR0cmlidXRlIHRoYXQncyBub3QgYW4gYXJyYXksIHdlIHdyYXAgaXQgaW4gYW4gYXJyYXkuXG4gKlxuICogRGF0ZXMgYXJlIHNlcmlhbGl6ZWQgYXMgSVNPIHN0cmluZ3MuXG4gKi9cbmV4cG9ydCB0eXBlIFNlYXJjaEF0dHJpYnV0ZXMgPSBSZWNvcmQ8c3RyaW5nLCBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSB8IFJlYWRvbmx5PFNlYXJjaEF0dHJpYnV0ZVZhbHVlPiB8IHVuZGVmaW5lZD47XG5leHBvcnQgdHlwZSBTZWFyY2hBdHRyaWJ1dGVWYWx1ZSA9IHN0cmluZ1tdIHwgbnVtYmVyW10gfCBib29sZWFuW10gfCBEYXRlW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgQWN0aXZpdHlGdW5jdGlvbjxQIGV4dGVuZHMgYW55W10gPSBhbnlbXSwgUiA9IGFueT4ge1xuICAoLi4uYXJnczogUCk6IFByb21pc2U8Uj47XG59XG5cbi8qKlxuICogTWFwcGluZyBvZiBBY3Rpdml0eSBuYW1lIHRvIGZ1bmN0aW9uXG4gKiBAZGVwcmVjYXRlZCBub3QgcmVxdWlyZWQgYW55bW9yZSwgZm9yIHVudHlwZWQgYWN0aXZpdGllcyB1c2Uge0BsaW5rIFVudHlwZWRBY3Rpdml0aWVzfVxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZSA9IFJlY29yZDxzdHJpbmcsIEFjdGl2aXR5RnVuY3Rpb24+O1xuXG4vKipcbiAqIE1hcHBpbmcgb2YgQWN0aXZpdHkgbmFtZSB0byBmdW5jdGlvblxuICovXG5leHBvcnQgdHlwZSBVbnR5cGVkQWN0aXZpdGllcyA9IFJlY29yZDxzdHJpbmcsIEFjdGl2aXR5RnVuY3Rpb24+O1xuXG4vKipcbiAqIEEgd29ya2Zsb3cncyBoaXN0b3J5IGFuZCBJRC4gVXNlZnVsIGZvciByZXBsYXkuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSGlzdG9yeUFuZFdvcmtmbG93SWQge1xuICB3b3JrZmxvd0lkOiBzdHJpbmc7XG4gIGhpc3Rvcnk6IHRlbXBvcmFsLmFwaS5oaXN0b3J5LnYxLkhpc3RvcnkgfCB1bmtub3duIHwgdW5kZWZpbmVkO1xufVxuIiwiZXhwb3J0IHR5cGUgTG9nTGV2ZWwgPSAnVFJBQ0UnIHwgJ0RFQlVHJyB8ICdJTkZPJyB8ICdXQVJOJyB8ICdFUlJPUic7XG5cbmV4cG9ydCB0eXBlIExvZ01ldGFkYXRhID0gUmVjb3JkPHN0cmluZyB8IHN5bWJvbCwgYW55PjtcblxuLyoqXG4gKiBJbXBsZW1lbnQgdGhpcyBpbnRlcmZhY2UgaW4gb3JkZXIgdG8gY3VzdG9taXplIHdvcmtlciBsb2dnaW5nXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgTG9nZ2VyIHtcbiAgbG9nKGxldmVsOiBMb2dMZXZlbCwgbWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG4gIHRyYWNlKG1lc3NhZ2U6IHN0cmluZywgbWV0YT86IExvZ01ldGFkYXRhKTogYW55O1xuICBkZWJ1ZyhtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgd2FybihtZXNzYWdlOiBzdHJpbmcsIG1ldGE/OiBMb2dNZXRhZGF0YSk6IGFueTtcbiAgZXJyb3IobWVzc2FnZTogc3RyaW5nLCBtZXRhPzogTG9nTWV0YWRhdGEpOiBhbnk7XG59XG4iLCJpbXBvcnQgdHlwZSB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgVmFsdWVFcnJvciB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9OdW1iZXIsIG1zT3B0aW9uYWxUb1RzLCBtc1RvTnVtYmVyLCBtc1RvVHMsIG9wdGlvbmFsVHNUb01zIH0gZnJvbSAnLi90aW1lJztcblxuLyoqXG4gKiBPcHRpb25zIGZvciByZXRyeWluZyBXb3JrZmxvd3MgYW5kIEFjdGl2aXRpZXNcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBSZXRyeVBvbGljeSB7XG4gIC8qKlxuICAgKiBDb2VmZmljaWVudCB1c2VkIHRvIGNhbGN1bGF0ZSB0aGUgbmV4dCByZXRyeSBpbnRlcnZhbC5cbiAgICogVGhlIG5leHQgcmV0cnkgaW50ZXJ2YWwgaXMgcHJldmlvdXMgaW50ZXJ2YWwgbXVsdGlwbGllZCBieSB0aGlzIGNvZWZmaWNpZW50LlxuICAgKiBAbWluaW11bSAxXG4gICAqIEBkZWZhdWx0IDJcbiAgICovXG4gIGJhY2tvZmZDb2VmZmljaWVudD86IG51bWJlcjtcbiAgLyoqXG4gICAqIEludGVydmFsIG9mIHRoZSBmaXJzdCByZXRyeS5cbiAgICogSWYgY29lZmZpY2llbnQgaXMgMSB0aGVuIGl0IGlzIHVzZWQgZm9yIGFsbCByZXRyaWVzXG4gICAqIEBmb3JtYXQgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBvciB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKiBAZGVmYXVsdCAxIHNlY29uZFxuICAgKi9cbiAgaW5pdGlhbEludGVydmFsPzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBNYXhpbXVtIG51bWJlciBvZiBhdHRlbXB0cy4gV2hlbiBleGNlZWRlZCwgcmV0cmllcyBzdG9wIChldmVuIGlmIHtAbGluayBBY3Rpdml0eU9wdGlvbnMuc2NoZWR1bGVUb0Nsb3NlVGltZW91dH1cbiAgICogaGFzbid0IGJlZW4gcmVhY2hlZCkuXG4gICAqXG4gICAqIEBkZWZhdWx0IEluZmluaXR5XG4gICAqL1xuICBtYXhpbXVtQXR0ZW1wdHM/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBNYXhpbXVtIGludGVydmFsIGJldHdlZW4gcmV0cmllcy5cbiAgICogRXhwb25lbnRpYWwgYmFja29mZiBsZWFkcyB0byBpbnRlcnZhbCBpbmNyZWFzZS5cbiAgICogVGhpcyB2YWx1ZSBpcyB0aGUgY2FwIG9mIHRoZSBpbmNyZWFzZS5cbiAgICpcbiAgICogQGRlZmF1bHQgMTAweCBvZiB7QGxpbmsgaW5pdGlhbEludGVydmFsfVxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIG1heGltdW1JbnRlcnZhbD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBMaXN0IG9mIGFwcGxpY2F0aW9uIGZhaWx1cmVzIHR5cGVzIHRvIG5vdCByZXRyeS5cbiAgICovXG4gIG5vblJldHJ5YWJsZUVycm9yVHlwZXM/OiBzdHJpbmdbXTtcbn1cblxuLyoqXG4gKiBUdXJuIGEgVFMgUmV0cnlQb2xpY3kgaW50byBhIHByb3RvIGNvbXBhdGlibGUgUmV0cnlQb2xpY3lcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbXBpbGVSZXRyeVBvbGljeShyZXRyeVBvbGljeTogUmV0cnlQb2xpY3kpOiB0ZW1wb3JhbC5hcGkuY29tbW9uLnYxLklSZXRyeVBvbGljeSB7XG4gIGlmIChyZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgIT0gbnVsbCAmJiByZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgPD0gMCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5iYWNrb2ZmQ29lZmZpY2llbnQgbXVzdCBiZSBncmVhdGVyIHRoYW4gMCcpO1xuICB9XG4gIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgIT0gbnVsbCkge1xuICAgIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPT09IE51bWJlci5QT1NJVElWRV9JTkZJTklUWSkge1xuICAgICAgLy8gZHJvcCBmaWVsZCAoSW5maW5pdHkgaXMgdGhlIGRlZmF1bHQpXG4gICAgICBjb25zdCB7IG1heGltdW1BdHRlbXB0czogXywgLi4ud2l0aG91dCB9ID0gcmV0cnlQb2xpY3k7XG4gICAgICByZXRyeVBvbGljeSA9IHdpdGhvdXQ7XG4gICAgfSBlbHNlIGlmIChyZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlcicpO1xuICAgIH0gZWxzZSBpZiAoIU51bWJlci5pc0ludGVnZXIocmV0cnlQb2xpY3kubWF4aW11bUF0dGVtcHRzKSkge1xuICAgICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyBtdXN0IGJlIGFuIGludGVnZXInKTtcbiAgICB9XG4gIH1cbiAgY29uc3QgbWF4aW11bUludGVydmFsID0gbXNPcHRpb25hbFRvTnVtYmVyKHJldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCk7XG4gIGNvbnN0IGluaXRpYWxJbnRlcnZhbCA9IG1zVG9OdW1iZXIocmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsID8/IDEwMDApO1xuICBpZiAobWF4aW11bUludGVydmFsID09PSAwKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoJ1JldHJ5UG9saWN5Lm1heGltdW1JbnRlcnZhbCBjYW5ub3QgYmUgMCcpO1xuICB9XG4gIGlmIChpbml0aWFsSW50ZXJ2YWwgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgVmFsdWVFcnJvcignUmV0cnlQb2xpY3kuaW5pdGlhbEludGVydmFsIGNhbm5vdCBiZSAwJyk7XG4gIH1cbiAgaWYgKG1heGltdW1JbnRlcnZhbCAhPSBudWxsICYmIG1heGltdW1JbnRlcnZhbCA8IGluaXRpYWxJbnRlcnZhbCkge1xuICAgIHRocm93IG5ldyBWYWx1ZUVycm9yKCdSZXRyeVBvbGljeS5tYXhpbXVtSW50ZXJ2YWwgY2Fubm90IGJlIGxlc3MgdGhhbiBpdHMgaW5pdGlhbEludGVydmFsJyk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBtYXhpbXVtQXR0ZW1wdHM6IHJldHJ5UG9saWN5Lm1heGltdW1BdHRlbXB0cyxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG1zVG9Ucyhpbml0aWFsSW50ZXJ2YWwpLFxuICAgIG1heGltdW1JbnRlcnZhbDogbXNPcHRpb25hbFRvVHMobWF4aW11bUludGVydmFsKSxcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCxcbiAgICBub25SZXRyeWFibGVFcnJvclR5cGVzOiByZXRyeVBvbGljeS5ub25SZXRyeWFibGVFcnJvclR5cGVzLFxuICB9O1xufVxuXG4vKipcbiAqIFR1cm4gYSBwcm90byBjb21wYXRpYmxlIFJldHJ5UG9saWN5IGludG8gYSBUUyBSZXRyeVBvbGljeVxuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb21waWxlUmV0cnlQb2xpY3koXG4gIHJldHJ5UG9saWN5PzogdGVtcG9yYWwuYXBpLmNvbW1vbi52MS5JUmV0cnlQb2xpY3kgfCBudWxsXG4pOiBSZXRyeVBvbGljeSB8IHVuZGVmaW5lZCB7XG4gIGlmICghcmV0cnlQb2xpY3kpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiYWNrb2ZmQ29lZmZpY2llbnQ6IHJldHJ5UG9saWN5LmJhY2tvZmZDb2VmZmljaWVudCA/PyB1bmRlZmluZWQsXG4gICAgbWF4aW11bUF0dGVtcHRzOiByZXRyeVBvbGljeS5tYXhpbXVtQXR0ZW1wdHMgPz8gdW5kZWZpbmVkLFxuICAgIG1heGltdW1JbnRlcnZhbDogb3B0aW9uYWxUc1RvTXMocmV0cnlQb2xpY3kubWF4aW11bUludGVydmFsKSxcbiAgICBpbml0aWFsSW50ZXJ2YWw6IG9wdGlvbmFsVHNUb01zKHJldHJ5UG9saWN5LmluaXRpYWxJbnRlcnZhbCksXG4gICAgbm9uUmV0cnlhYmxlRXJyb3JUeXBlczogcmV0cnlQb2xpY3kubm9uUmV0cnlhYmxlRXJyb3JUeXBlcyA/PyB1bmRlZmluZWQsXG4gIH07XG59XG4iLCJpbXBvcnQgTG9uZyBmcm9tICdsb25nJzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBpbXBvcnQvbm8tbmFtZWQtYXMtZGVmYXVsdFxuaW1wb3J0IG1zLCB7IFN0cmluZ1ZhbHVlIH0gZnJvbSAnbXMnO1xuaW1wb3J0IHR5cGUgeyBnb29nbGUgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBWYWx1ZUVycm9yIH0gZnJvbSAnLi9lcnJvcnMnO1xuXG4vLyBOT1RFOiB0aGVzZSBhcmUgdGhlIHNhbWUgaW50ZXJmYWNlIGluIEpTXG4vLyBnb29nbGUucHJvdG9idWYuSUR1cmF0aW9uO1xuLy8gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG4vLyBUaGUgY29udmVyc2lvbiBmdW5jdGlvbnMgYmVsb3cgc2hvdWxkIHdvcmsgZm9yIGJvdGhcblxuZXhwb3J0IHR5cGUgVGltZXN0YW1wID0gZ29vZ2xlLnByb3RvYnVmLklUaW1lc3RhbXA7XG5cbi8qKlxuICogQSBkdXJhdGlvbiwgZXhwcmVzc2VkIGVpdGhlciBhcyBhIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIG9yIGFzIGEge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKi9cbmV4cG9ydCB0eXBlIER1cmF0aW9uID0gU3RyaW5nVmFsdWUgfCBudW1iZXI7XG5cbmV4cG9ydCB0eXBlIHsgU3RyaW5nVmFsdWUgfSBmcm9tICdtcyc7XG5cbi8qKlxuICogTG9zc3kgY29udmVyc2lvbiBmdW5jdGlvbiBmcm9tIFRpbWVzdGFtcCB0byBudW1iZXIgZHVlIHRvIHBvc3NpYmxlIG92ZXJmbG93LlxuICogSWYgdHMgaXMgbnVsbCBvciB1bmRlZmluZWQgcmV0dXJucyB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbFRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB8IHVuZGVmaW5lZCB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICByZXR1cm4gdHNUb01zKHRzKTtcbn1cblxuLyoqXG4gKiBMb3NzeSBjb252ZXJzaW9uIGZ1bmN0aW9uIGZyb20gVGltZXN0YW1wIHRvIG51bWJlciBkdWUgdG8gcG9zc2libGUgb3ZlcmZsb3dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRzVG9Ncyh0czogVGltZXN0YW1wIHwgbnVsbCB8IHVuZGVmaW5lZCk6IG51bWJlciB7XG4gIGlmICh0cyA9PT0gdW5kZWZpbmVkIHx8IHRzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCB0aW1lc3RhbXAsIGdvdCAke3RzfWApO1xuICB9XG4gIGNvbnN0IHsgc2Vjb25kcywgbmFub3MgfSA9IHRzO1xuICByZXR1cm4gKHNlY29uZHMgfHwgTG9uZy5VWkVSTylcbiAgICAubXVsKDEwMDApXG4gICAgLmFkZChNYXRoLmZsb29yKChuYW5vcyB8fCAwKSAvIDEwMDAwMDApKVxuICAgIC50b051bWJlcigpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNOdW1iZXJUb1RzKG1pbGxpczogbnVtYmVyKTogVGltZXN0YW1wIHtcbiAgY29uc3Qgc2Vjb25kcyA9IE1hdGguZmxvb3IobWlsbGlzIC8gMTAwMCk7XG4gIGNvbnN0IG5hbm9zID0gKG1pbGxpcyAlIDEwMDApICogMTAwMDAwMDtcbiAgaWYgKE51bWJlci5pc05hTihzZWNvbmRzKSB8fCBOdW1iZXIuaXNOYU4obmFub3MpKSB7XG4gICAgdGhyb3cgbmV3IFZhbHVlRXJyb3IoYEludmFsaWQgbWlsbGlzICR7bWlsbGlzfWApO1xuICB9XG4gIHJldHVybiB7IHNlY29uZHM6IExvbmcuZnJvbU51bWJlcihzZWNvbmRzKSwgbmFub3MgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zVG9UcyhzdHI6IER1cmF0aW9uKTogVGltZXN0YW1wIHtcbiAgcmV0dXJuIG1zTnVtYmVyVG9Ucyhtc1RvTnVtYmVyKHN0cikpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNPcHRpb25hbFRvVHMoc3RyOiBEdXJhdGlvbiB8IHVuZGVmaW5lZCk6IFRpbWVzdGFtcCB8IHVuZGVmaW5lZCB7XG4gIHJldHVybiBzdHIgPyBtc1RvVHMoc3RyKSA6IHVuZGVmaW5lZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1zT3B0aW9uYWxUb051bWJlcih2YWw6IER1cmF0aW9uIHwgdW5kZWZpbmVkKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkO1xuICByZXR1cm4gbXNUb051bWJlcih2YWwpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbXNUb051bWJlcih2YWw6IER1cmF0aW9uKTogbnVtYmVyIHtcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIHZhbDtcbiAgfVxuICByZXR1cm4gbXNXaXRoVmFsaWRhdGlvbih2YWwpO1xufVxuXG5mdW5jdGlvbiBtc1dpdGhWYWxpZGF0aW9uKHN0cjogU3RyaW5nVmFsdWUpOiBudW1iZXIge1xuICBjb25zdCBtaWxsaXMgPSBtcyhzdHIpO1xuICBpZiAobWlsbGlzID09IG51bGwgfHwgaXNOYU4obWlsbGlzKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZHVyYXRpb24gc3RyaW5nOiAnJHtzdHJ9J2ApO1xuICB9XG4gIHJldHVybiBtaWxsaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0c1RvRGF0ZSh0czogVGltZXN0YW1wKTogRGF0ZSB7XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsVHNUb0RhdGUodHM6IFRpbWVzdGFtcCB8IG51bGwgfCB1bmRlZmluZWQpOiBEYXRlIHwgdW5kZWZpbmVkIHtcbiAgaWYgKHRzID09PSB1bmRlZmluZWQgfHwgdHMgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZSh0c1RvTXModHMpKTtcbn1cblxuLy8gdHMtcHJ1bmUtaWdub3JlLW5leHQgKGltcG9ydGVkIHZpYSBzY2hlZHVsZS1oZWxwZXJzLnRzKVxuZXhwb3J0IGZ1bmN0aW9uIG9wdGlvbmFsRGF0ZVRvVHMoZGF0ZTogRGF0ZSB8IG51bGwgfCB1bmRlZmluZWQpOiBUaW1lc3RhbXAgfCB1bmRlZmluZWQge1xuICBpZiAoZGF0ZSA9PT0gdW5kZWZpbmVkIHx8IGRhdGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIHJldHVybiBtc1RvVHMoZGF0ZS5nZXRUaW1lKCkpO1xufVxuIiwiLyoqIFNob3J0aGFuZCBhbGlhcyAqL1xuZXhwb3J0IHR5cGUgQW55RnVuYyA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYW55O1xuLyoqIEEgdHVwbGUgd2l0aG91dCBpdHMgbGFzdCBlbGVtZW50ICovXG5leHBvcnQgdHlwZSBPbWl0TGFzdDxUPiA9IFQgZXh0ZW5kcyBbLi4uaW5mZXIgUkVTVCwgYW55XSA/IFJFU1QgOiBuZXZlcjtcbi8qKiBGIHdpdGggYWxsIGFyZ3VtZW50cyBidXQgdGhlIGxhc3QgKi9cbmV4cG9ydCB0eXBlIE9taXRMYXN0UGFyYW08RiBleHRlbmRzIEFueUZ1bmM+ID0gKC4uLmFyZ3M6IE9taXRMYXN0PFBhcmFtZXRlcnM8Rj4+KSA9PiBSZXR1cm5UeXBlPEY+O1xuLyoqIFJlcXVpcmUgdGhhdCBUIGhhcyBhdCBsZWFzdCBvbmUgb2YgdGhlIHByb3ZpZGVkIHByb3BlcnRpZXMgZGVmaW5lZCAqL1xuZXhwb3J0IHR5cGUgUmVxdWlyZUF0TGVhc3RPbmU8VCwgS2V5cyBleHRlbmRzIGtleW9mIFQgPSBrZXlvZiBUPiA9IFBpY2s8VCwgRXhjbHVkZTxrZXlvZiBULCBLZXlzPj4gJlxuICB7XG4gICAgW0sgaW4gS2V5c10tPzogUmVxdWlyZWQ8UGljazxULCBLPj4gJiBQYXJ0aWFsPFBpY2s8VCwgRXhjbHVkZTxLZXlzLCBLPj4+O1xuICB9W0tleXNdO1xuXG4vKiogVmVyaWZ5IHRoYXQgYW4gdHlwZSBfQ29weSBleHRlbmRzIF9PcmlnICovXG5leHBvcnQgZnVuY3Rpb24gY2hlY2tFeHRlbmRzPF9PcmlnLCBfQ29weSBleHRlbmRzIF9PcmlnPigpOiB2b2lkIHtcbiAgLy8gbm9vcCwganVzdCB0eXBlIGNoZWNrXG59XG5cbmV4cG9ydCB0eXBlIFJlcGxhY2U8QmFzZSwgTmV3PiA9IE9taXQ8QmFzZSwga2V5b2YgTmV3PiAmIE5ldztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzUmVjb3JkKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAhPT0gbnVsbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnR5PFggZXh0ZW5kcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgWSBleHRlbmRzIFByb3BlcnR5S2V5PihcbiAgcmVjb3JkOiBYLFxuICBwcm9wOiBZXG4pOiByZWNvcmQgaXMgWCAmIFJlY29yZDxZLCB1bmtub3duPiB7XG4gIHJldHVybiBwcm9wIGluIHJlY29yZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhhc093blByb3BlcnRpZXM8WCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBZIGV4dGVuZHMgUHJvcGVydHlLZXk+KFxuICByZWNvcmQ6IFgsXG4gIHByb3BzOiBZW11cbik6IHJlY29yZCBpcyBYICYgUmVjb3JkPFksIHVua25vd24+IHtcbiAgcmV0dXJuIHByb3BzLmV2ZXJ5KChwcm9wKSA9PiBwcm9wIGluIHJlY29yZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Vycm9yKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3Ige1xuICByZXR1cm4gKFxuICAgIGlzUmVjb3JkKGVycm9yKSAmJlxuICAgIHR5cGVvZiBlcnJvci5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgIHR5cGVvZiBlcnJvci5tZXNzYWdlID09PSAnc3RyaW5nJyAmJlxuICAgIChlcnJvci5zdGFjayA9PSBudWxsIHx8IHR5cGVvZiBlcnJvci5zdGFjayA9PT0gJ3N0cmluZycpXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Fib3J0RXJyb3IoZXJyb3I6IHVua25vd24pOiBlcnJvciBpcyBFcnJvciAmIHsgbmFtZTogJ0Fib3J0RXJyb3InIH0ge1xuICByZXR1cm4gaXNFcnJvcihlcnJvcikgJiYgZXJyb3IubmFtZSA9PT0gJ0Fib3J0RXJyb3InO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IubWVzc2FnZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JNZXNzYWdlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzRXJyb3IoZXJyb3IpKSB7XG4gICAgcmV0dXJuIGVycm9yLm1lc3NhZ2U7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVycm9yID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBlcnJvcjtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5pbnRlcmZhY2UgRXJyb3JXaXRoQ29kZSB7XG4gIGNvZGU6IHN0cmluZztcbn1cblxuZnVuY3Rpb24gaXNFcnJvcldpdGhDb2RlKGVycm9yOiB1bmtub3duKTogZXJyb3IgaXMgRXJyb3JXaXRoQ29kZSB7XG4gIHJldHVybiBpc1JlY29yZChlcnJvcikgJiYgdHlwZW9mIGVycm9yLmNvZGUgPT09ICdzdHJpbmcnO1xufVxuXG4vKipcbiAqIEdldCBgZXJyb3IuY29kZWAgKG9yIGB1bmRlZmluZWRgIGlmIG5vdCBwcmVzZW50KVxuICovXG5leHBvcnQgZnVuY3Rpb24gZXJyb3JDb2RlKGVycm9yOiB1bmtub3duKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgaWYgKGlzRXJyb3JXaXRoQ29kZShlcnJvcikpIHtcbiAgICByZXR1cm4gZXJyb3IuY29kZTtcbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQXNzZXJ0cyB0aGF0IHNvbWUgdHlwZSBpcyB0aGUgbmV2ZXIgdHlwZVxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIobXNnOiBzdHJpbmcsIHg6IG5ldmVyKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgVHlwZUVycm9yKG1zZyArICc6ICcgKyB4KTtcbn1cblxuZXhwb3J0IHR5cGUgQ2xhc3M8RSBleHRlbmRzIEVycm9yPiA9IHtcbiAgbmV3ICguLi5hcmdzOiBhbnlbXSk6IEU7XG4gIHByb3RvdHlwZTogRTtcbn07XG5cbi8qKlxuICogQSBkZWNvcmF0b3IgdG8gYmUgdXNlZCBvbiBlcnJvciBjbGFzc2VzLiBJdCBhZGRzIHRoZSAnbmFtZScgcHJvcGVydHkgQU5EIHByb3ZpZGVzIGEgY3VzdG9tXG4gKiAnaW5zdGFuY2VvZicgaGFuZGxlciB0aGF0IHdvcmtzIGNvcnJlY3RseSBhY3Jvc3MgZXhlY3V0aW9uIGNvbnRleHRzLlxuICpcbiAqICMjIyBEZXRhaWxzICMjI1xuICpcbiAqIEFjY29yZGluZyB0byB0aGUgRWNtYVNjcmlwdCdzIHNwZWMsIHRoZSBkZWZhdWx0IGJlaGF2aW9yIG9mIEphdmFTY3JpcHQncyBgeCBpbnN0YW5jZW9mIFlgIG9wZXJhdG9yIGlzIHRvIHdhbGsgdXAgdGhlXG4gKiBwcm90b3R5cGUgY2hhaW4gb2Ygb2JqZWN0ICd4JywgY2hlY2tpbmcgaWYgYW55IGNvbnN0cnVjdG9yIGluIHRoYXQgaGllcmFyY2h5IGlzIF9leGFjdGx5IHRoZSBzYW1lIG9iamVjdF8gYXMgdGhlXG4gKiBjb25zdHJ1Y3RvciBmdW5jdGlvbiAnWScuXG4gKlxuICogVW5mb3J0dW5hdGVseSwgaXQgaGFwcGVucyBpbiB2YXJpb3VzIHNpdHVhdGlvbnMgdGhhdCBkaWZmZXJlbnQgY29uc3RydWN0b3IgZnVuY3Rpb24gb2JqZWN0cyBnZXQgY3JlYXRlZCBmb3Igd2hhdFxuICogYXBwZWFycyB0byBiZSB0aGUgdmVyeSBzYW1lIGNsYXNzLiBUaGlzIGxlYWRzIHRvIHN1cnByaXNpbmcgYmVoYXZpb3Igd2hlcmUgYGluc3RhbmNlb2ZgIHJldHVybnMgZmFsc2UgdGhvdWdoIGl0IGlzXG4gKiBrbm93biB0aGF0IHRoZSBvYmplY3QgaXMgaW5kZWVkIGFuIGluc3RhbmNlIG9mIHRoYXQgY2xhc3MuIE9uZSBwYXJ0aWN1bGFyIGNhc2Ugd2hlcmUgdGhpcyBoYXBwZW5zIGlzIHdoZW4gY29uc3RydWN0b3JcbiAqICdZJyBiZWxvbmdzIHRvIGEgZGlmZmVyZW50IHJlYWxtIHRoYW4gdGhlIGNvbnN0dWN0b3Igd2l0aCB3aGljaCAneCcgd2FzIGluc3RhbnRpYXRlZC4gQW5vdGhlciBjYXNlIGlzIHdoZW4gdHdvIGNvcGllc1xuICogb2YgdGhlIHNhbWUgbGlicmFyeSBnZXRzIGxvYWRlZCBpbiB0aGUgc2FtZSByZWFsbS5cbiAqXG4gKiBJbiBwcmFjdGljZSwgdGhpcyB0ZW5kcyB0byBjYXVzZSBpc3N1ZXMgd2hlbiBjcm9zc2luZyB0aGUgd29ya2Zsb3ctc2FuZGJveGluZyBib3VuZGFyeSAoc2luY2UgTm9kZSdzIHZtIG1vZHVsZVxuICogcmVhbGx5IGNyZWF0ZXMgbmV3IGV4ZWN1dGlvbiByZWFsbXMpLCBhcyB3ZWxsIGFzIHdoZW4gcnVubmluZyB0ZXN0cyB1c2luZyBKZXN0IChzZWUgaHR0cHM6Ly9naXRodWIuY29tL2plc3Rqcy9qZXN0L2lzc3Vlcy8yNTQ5XG4gKiBmb3Igc29tZSBkZXRhaWxzIG9uIHRoYXQgb25lKS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGluamVjdHMgYSBjdXN0b20gJ2luc3RhbmNlb2YnIGhhbmRsZXIgaW50byB0aGUgcHJvdG90eXBlIG9mICdjbGF6eicsIHdoaWNoIGlzIGJvdGggY3Jvc3MtcmVhbG0gc2FmZSBhbmRcbiAqIGNyb3NzLWNvcGllcy1vZi10aGUtc2FtZS1saWIgc2FmZS4gSXQgd29ya3MgYnkgYWRkaW5nIGEgc3BlY2lhbCBzeW1ib2wgcHJvcGVydHkgdG8gdGhlIHByb3RvdHlwZSBvZiAnY2xhenonLCBhbmQgdGhlblxuICogY2hlY2tpbmcgZm9yIHRoZSBwcmVzZW5jZSBvZiB0aGF0IHN5bWJvbC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yPEUgZXh0ZW5kcyBFcnJvcj4obWFya2VyTmFtZTogc3RyaW5nKTogKGNsYXp6OiBDbGFzczxFPikgPT4gdm9pZCB7XG4gIHJldHVybiAoY2xheno6IENsYXNzPEU+KTogdm9pZCA9PiB7XG4gICAgY29uc3QgbWFya2VyID0gU3ltYm9sLmZvcihgX190ZW1wb3JhbF9pcyR7bWFya2VyTmFtZX1gKTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6ei5wcm90b3R5cGUsICduYW1lJywgeyB2YWx1ZTogbWFya2VyTmFtZSwgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY2xhenoucHJvdG90eXBlLCBtYXJrZXIsIHsgdmFsdWU6IHRydWUsIGVudW1lcmFibGU6IGZhbHNlIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjbGF6eiwgU3ltYm9sLmhhc0luc3RhbmNlLCB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgb2JqZWN0LXNob3J0aGFuZFxuICAgICAgdmFsdWU6IGZ1bmN0aW9uICh0aGlzOiBhbnksIGVycm9yOiBvYmplY3QpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMgPT09IGNsYXp6KSB7XG4gICAgICAgICAgcmV0dXJuIGlzUmVjb3JkKGVycm9yKSAmJiAoZXJyb3IgYXMgYW55KVttYXJrZXJdID09PSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vICd0aGlzJyBtdXN0IGJlIGEgX3N1YmNsYXNzXyBvZiBjbGF6eiB0aGF0IGRvZXNuJ3QgcmVkZWZpbmVkIFtTeW1ib2wuaGFzSW5zdGFuY2VdLCBzbyB0aGF0IGl0IGluaGVyaXRlZFxuICAgICAgICAgIC8vIGZyb20gY2xhenoncyBbU3ltYm9sLmhhc0luc3RhbmNlXS4gSWYgd2UgZG9uJ3QgaGFuZGxlIHRoaXMgcGFydGljdWxhciBzaXR1YXRpb24sIHRoZW5cbiAgICAgICAgICAvLyBgeCBpbnN0YW5jZW9mIFN1YmNsYXNzT2ZQYXJlbnRgIHdvdWxkIHJldHVybiB0cnVlIGZvciBhbnkgaW5zdGFuY2Ugb2YgJ1BhcmVudCcsIHdoaWNoIGlzIGNsZWFybHkgd3JvbmcuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyBJZGVhbGx5LCBpdCdkIGJlIHByZWZlcmFibGUgdG8gYXZvaWQgdGhpcyBjYXNlIGVudGlyZWx5LCBieSBtYWtpbmcgc3VyZSB0aGF0IGFsbCBzdWJjbGFzc2VzIG9mICdjbGF6eidcbiAgICAgICAgICAvLyByZWRlZmluZSBbU3ltYm9sLmhhc0luc3RhbmNlXSwgYnV0IHdlIGNhbid0IGVuZm9yY2UgdGhhdC4gV2UgdGhlcmVmb3JlIGZhbGxiYWNrIHRvIHRoZSBkZWZhdWx0IGluc3RhbmNlb2ZcbiAgICAgICAgICAvLyBiZWhhdmlvciAod2hpY2ggaXMgTk9UIGNyb3NzLXJlYWxtIHNhZmUpLlxuICAgICAgICAgIHJldHVybiB0aGlzLnByb3RvdHlwZS5pc1Byb3RvdHlwZU9mKGVycm9yKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcbn1cblxuLy8gVGhhbmtzIE1ETjogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2ZyZWV6ZVxuZXhwb3J0IGZ1bmN0aW9uIGRlZXBGcmVlemU8VD4ob2JqZWN0OiBUKTogVCB7XG4gIC8vIFJldHJpZXZlIHRoZSBwcm9wZXJ0eSBuYW1lcyBkZWZpbmVkIG9uIG9iamVjdFxuICBjb25zdCBwcm9wTmFtZXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmplY3QpO1xuXG4gIC8vIEZyZWV6ZSBwcm9wZXJ0aWVzIGJlZm9yZSBmcmVlemluZyBzZWxmXG4gIGZvciAoY29uc3QgbmFtZSBvZiBwcm9wTmFtZXMpIHtcbiAgICBjb25zdCB2YWx1ZSA9IChvYmplY3QgYXMgYW55KVtuYW1lXTtcblxuICAgIGlmICh2YWx1ZSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkZWVwRnJlZXplKHZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAvLyBUaGlzIGlzIG9rYXksIHRoZXJlIGFyZSBzb21lIHR5cGVkIGFycmF5cyB0aGF0IGNhbm5vdCBiZSBmcm96ZW4gKGVuY29kaW5nS2V5cylcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgT2JqZWN0LmZyZWV6ZSh2YWx1ZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIE9iamVjdC5mcmVlemUob2JqZWN0KTtcbn1cbiIsImltcG9ydCB0eXBlIHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB0eXBlIHsgVmVyc2lvbmluZ0ludGVudCBhcyBWZXJzaW9uaW5nSW50ZW50U3RyaW5nIH0gZnJvbSAnLi92ZXJzaW9uaW5nLWludGVudCc7XG5pbXBvcnQgeyBhc3NlcnROZXZlciwgY2hlY2tFeHRlbmRzIH0gZnJvbSAnLi90eXBlLWhlbHBlcnMnO1xuXG4vLyBBdm9pZCBpbXBvcnRpbmcgdGhlIHByb3RvIGltcGxlbWVudGF0aW9uIHRvIHJlZHVjZSB3b3JrZmxvdyBidW5kbGUgc2l6ZVxuLy8gQ29waWVkIGZyb20gY29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudFxuLyoqXG4gKiBQcm90b2J1ZiBlbnVtIHJlcHJlc2VudGF0aW9uIG9mIHtAbGluayBWZXJzaW9uaW5nSW50ZW50U3RyaW5nfS5cbiAqXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCBlbnVtIFZlcnNpb25pbmdJbnRlbnQge1xuICBVTlNQRUNJRklFRCA9IDAsXG4gIENPTVBBVElCTEUgPSAxLFxuICBERUZBVUxUID0gMixcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY29tbW9uLlZlcnNpb25pbmdJbnRlbnQsIFZlcnNpb25pbmdJbnRlbnQ+KCk7XG5jaGVja0V4dGVuZHM8VmVyc2lvbmluZ0ludGVudCwgY29yZXNkay5jb21tb24uVmVyc2lvbmluZ0ludGVudD4oKTtcblxuZXhwb3J0IGZ1bmN0aW9uIHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKGludGVudDogVmVyc2lvbmluZ0ludGVudFN0cmluZyB8IHVuZGVmaW5lZCk6IFZlcnNpb25pbmdJbnRlbnQge1xuICBzd2l0Y2ggKGludGVudCkge1xuICAgIGNhc2UgJ0RFRkFVTFQnOlxuICAgICAgcmV0dXJuIFZlcnNpb25pbmdJbnRlbnQuREVGQVVMVDtcbiAgICBjYXNlICdDT01QQVRJQkxFJzpcbiAgICAgIHJldHVybiBWZXJzaW9uaW5nSW50ZW50LkNPTVBBVElCTEU7XG4gICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICByZXR1cm4gVmVyc2lvbmluZ0ludGVudC5VTlNQRUNJRklFRDtcbiAgICBkZWZhdWx0OlxuICAgICAgYXNzZXJ0TmV2ZXIoJ1VuZXhwZWN0ZWQgVmVyc2lvbmluZ0ludGVudCcsIGludGVudCk7XG4gIH1cbn1cbiIsIi8qKlxuICogSW5kaWNhdGVzIHdoZXRoZXIgdGhlIHVzZXIgaW50ZW5kcyBjZXJ0YWluIGNvbW1hbmRzIHRvIGJlIHJ1biBvbiBhIGNvbXBhdGlibGUgd29ya2VyIEJ1aWxkIElkIHZlcnNpb24gb3Igbm90LlxuICpcbiAqIGBDT01QQVRJQkxFYCBpbmRpY2F0ZXMgdGhhdCB0aGUgY29tbWFuZCBzaG91bGQgcnVuIG9uIGEgd29ya2VyIHdpdGggY29tcGF0aWJsZSB2ZXJzaW9uIGlmIHBvc3NpYmxlLiBJdCBtYXkgbm90IGJlXG4gKiBwb3NzaWJsZSBpZiB0aGUgdGFyZ2V0IHRhc2sgcXVldWUgZG9lcyBub3QgYWxzbyBoYXZlIGtub3dsZWRnZSBvZiB0aGUgY3VycmVudCB3b3JrZXIncyBCdWlsZCBJZC5cbiAqXG4gKiBgREVGQVVMVGAgaW5kaWNhdGVzIHRoYXQgdGhlIGNvbW1hbmQgc2hvdWxkIHJ1biBvbiB0aGUgdGFyZ2V0IHRhc2sgcXVldWUncyBjdXJyZW50IG92ZXJhbGwtZGVmYXVsdCBCdWlsZCBJZC5cbiAqXG4gKiBXaGVyZSB0aGlzIHR5cGUgaXMgYWNjZXB0ZWQgb3B0aW9uYWxseSwgYW4gdW5zZXQgdmFsdWUgaW5kaWNhdGVzIHRoYXQgdGhlIFNESyBzaG91bGQgY2hvb3NlIHRoZSBtb3N0IHNlbnNpYmxlIGRlZmF1bHRcbiAqIGJlaGF2aW9yIGZvciB0aGUgdHlwZSBvZiBjb21tYW5kLCBhY2NvdW50aW5nIGZvciB3aGV0aGVyIHRoZSBjb21tYW5kIHdpbGwgYmUgcnVuIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgdGhlXG4gKiBjdXJyZW50IHdvcmtlci4gVGhlIGRlZmF1bHQgYmVoYXZpb3IgZm9yIHN0YXJ0aW5nIFdvcmtmbG93cyBpcyBgREVGQVVMVGAuIFRoZSBkZWZhdWx0IGJlaGF2aW9yIGZvciBXb3JrZmxvd3Mgc3RhcnRpbmdcbiAqIEFjdGl2aXRpZXMsIHN0YXJ0aW5nIENoaWxkIFdvcmtmbG93cywgb3IgQ29udGludWluZyBBcyBOZXcgaXMgYENPTVBBVElCTEVgLlxuICpcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuZXhwb3J0IHR5cGUgVmVyc2lvbmluZ0ludGVudCA9ICdDT01QQVRJQkxFJyB8ICdERUZBVUxUJztcbiIsImltcG9ydCB7IFdvcmtmbG93LCBXb3JrZmxvd1Jlc3VsdFR5cGUsIFNpZ25hbERlZmluaXRpb24gfSBmcm9tICcuL2ludGVyZmFjZXMnO1xuXG4vKipcbiAqIEJhc2UgV29ya2Zsb3dIYW5kbGUgaW50ZXJmYWNlLCBleHRlbmRlZCBpbiB3b3JrZmxvdyBhbmQgY2xpZW50IGxpYnMuXG4gKlxuICogVHJhbnNmb3JtcyBhIHdvcmtmbG93IGludGVyZmFjZSBgVGAgaW50byBhIGNsaWVudCBpbnRlcmZhY2UuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93SGFuZGxlPFQgZXh0ZW5kcyBXb3JrZmxvdz4ge1xuICAvKipcbiAgICogUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gV29ya2Zsb3cgZXhlY3V0aW9uIGNvbXBsZXRlc1xuICAgKi9cbiAgcmVzdWx0KCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuICAvKipcbiAgICogU2lnbmFsIGEgcnVubmluZyBXb3JrZmxvdy5cbiAgICpcbiAgICogQHBhcmFtIGRlZiBhIHNpZ25hbCBkZWZpbml0aW9uIGFzIHJldHVybmVkIGZyb20ge0BsaW5rIGRlZmluZVNpZ25hbH1cbiAgICpcbiAgICogQGV4YW1wbGVcbiAgICogYGBgdHNcbiAgICogYXdhaXQgaGFuZGxlLnNpZ25hbChpbmNyZW1lbnRTaWduYWwsIDMpO1xuICAgKiBgYGBcbiAgICovXG4gIHNpZ25hbDxBcmdzIGV4dGVuZHMgYW55W10gPSBbXSwgTmFtZSBleHRlbmRzIHN0cmluZyA9IHN0cmluZz4oXG4gICAgZGVmOiBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+IHwgc3RyaW5nLFxuICAgIC4uLmFyZ3M6IEFyZ3NcbiAgKTogUHJvbWlzZTx2b2lkPjtcblxuICAvKipcbiAgICogVGhlIHdvcmtmbG93SWQgb2YgdGhlIGN1cnJlbnQgV29ya2Zsb3dcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcbn1cbiIsImltcG9ydCB0eXBlIHsgdGVtcG9yYWwgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBTZWFyY2hBdHRyaWJ1dGVzLCBXb3JrZmxvdyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBSZXRyeVBvbGljeSB9IGZyb20gJy4vcmV0cnktcG9saWN5JztcbmltcG9ydCB7IER1cmF0aW9uIH0gZnJvbSAnLi90aW1lJztcbmltcG9ydCB7IGNoZWNrRXh0ZW5kcyB9IGZyb20gJy4vdHlwZS1oZWxwZXJzJztcblxuLy8gQXZvaWQgaW1wb3J0aW5nIHRoZSBwcm90byBpbXBsZW1lbnRhdGlvbiB0byByZWR1Y2Ugd29ya2Zsb3cgYnVuZGxlIHNpemVcbi8vIENvcGllZCBmcm9tIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3lcbi8qKlxuICogQ29uY2VwdDoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtd29ya2Zsb3ctaWQtcmV1c2UtcG9saWN5LyB8IFdvcmtmbG93IElkIFJldXNlIFBvbGljeX1cbiAqXG4gKiBXaGV0aGVyIGEgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgQ2xvc2VkIFdvcmtmbG93LlxuICpcbiAqICpOb3RlOiBBIFdvcmtmbG93IGNhbiBuZXZlciBiZSBzdGFydGVkIHdpdGggYSBXb3JrZmxvdyBJZCBvZiBhIFJ1bm5pbmcgV29ya2Zsb3cuKlxuICovXG5leHBvcnQgZW51bSBXb3JrZmxvd0lkUmV1c2VQb2xpY3kge1xuICAvKipcbiAgICogTm8gbmVlZCB0byB1c2UgdGhpcy5cbiAgICpcbiAgICogKElmIGEgYFdvcmtmbG93SWRSZXVzZVBvbGljeWAgaXMgc2V0IHRvIHRoaXMsIG9yIGlzIG5vdCBzZXQgYXQgYWxsLCB0aGUgZGVmYXVsdCB2YWx1ZSB3aWxsIGJlIHVzZWQuKVxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1VOU1BFQ0lGSUVEID0gMCxcblxuICAvKipcbiAgICogVGhlIFdvcmtmbG93IGNhbiBiZSBzdGFydGVkIGlmIHRoZSBwcmV2aW91cyBXb3JrZmxvdyBpcyBpbiBhIENsb3NlZCBzdGF0ZS5cbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEUgPSAxLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgaWYgdGhlIHByZXZpb3VzIFdvcmtmbG93IGlzIGluIGEgQ2xvc2VkIHN0YXRlIHRoYXQgaXMgbm90IENvbXBsZXRlZC5cbiAgICovXG4gIFdPUktGTE9XX0lEX1JFVVNFX1BPTElDWV9BTExPV19EVVBMSUNBVEVfRkFJTEVEX09OTFkgPSAyLFxuXG4gIC8qKlxuICAgKiBUaGUgV29ya2Zsb3cgY2Fubm90IGJlIHN0YXJ0ZWQuXG4gICAqL1xuICBXT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfUkVKRUNUX0RVUExJQ0FURSA9IDMsXG5cbiAgLyoqXG4gICAqIFRlcm1pbmF0ZSB0aGUgY3VycmVudCB3b3JrZmxvdyBpZiBvbmUgaXMgYWxyZWFkeSBydW5uaW5nLlxuICAgKi9cbiAgV09SS0ZMT1dfSURfUkVVU0VfUE9MSUNZX1RFUk1JTkFURV9JRl9SVU5OSU5HID0gNCxcbn1cblxuY2hlY2tFeHRlbmRzPHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3ksIFdvcmtmbG93SWRSZXVzZVBvbGljeT4oKTtcbmNoZWNrRXh0ZW5kczxXb3JrZmxvd0lkUmV1c2VQb2xpY3ksIHRlbXBvcmFsLmFwaS5lbnVtcy52MS5Xb3JrZmxvd0lkUmV1c2VQb2xpY3k+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQmFzZVdvcmtmbG93T3B0aW9ucyB7XG4gIC8qKlxuICAgKiBXaGV0aGVyIGEgV29ya2Zsb3cgY2FuIGJlIHN0YXJ0ZWQgd2l0aCBhIFdvcmtmbG93IElkIG9mIGEgQ2xvc2VkIFdvcmtmbG93LlxuICAgKlxuICAgKiAqTm90ZTogQSBXb3JrZmxvdyBjYW4gbmV2ZXIgYmUgc3RhcnRlZCB3aXRoIGEgV29ya2Zsb3cgSWQgb2YgYSBSdW5uaW5nIFdvcmtmbG93LipcbiAgICpcbiAgICogQGRlZmF1bHQge0BsaW5rIFdvcmtmbG93SWRSZXVzZVBvbGljeS5XT1JLRkxPV19JRF9SRVVTRV9QT0xJQ1lfQUxMT1dfRFVQTElDQVRFfVxuICAgKi9cbiAgd29ya2Zsb3dJZFJldXNlUG9saWN5PzogV29ya2Zsb3dJZFJldXNlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBDb250cm9scyBob3cgYSBXb3JrZmxvdyBFeGVjdXRpb24gaXMgcmV0cmllZC5cbiAgICpcbiAgICogQnkgZGVmYXVsdCwgV29ya2Zsb3cgRXhlY3V0aW9ucyBhcmUgbm90IHJldHJpZWQuIERvIG5vdCBvdmVycmlkZSB0aGlzIGJlaGF2aW9yIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSdyZSBkb2luZy5cbiAgICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcmV0cnktcG9saWN5LyB8IE1vcmUgaW5mb3JtYXRpb259LlxuICAgKi9cbiAgcmV0cnk/OiBSZXRyeVBvbGljeTtcblxuICAvKipcbiAgICogT3B0aW9uYWwgY3JvbiBzY2hlZHVsZSBmb3IgV29ya2Zsb3cuIElmIGEgY3JvbiBzY2hlZHVsZSBpcyBzcGVjaWZpZWQsIHRoZSBXb3JrZmxvdyB3aWxsIHJ1biBhcyBhIGNyb24gYmFzZWQgb24gdGhlXG4gICAqIHNjaGVkdWxlLiBUaGUgc2NoZWR1bGluZyB3aWxsIGJlIGJhc2VkIG9uIFVUQyB0aW1lLiBUaGUgc2NoZWR1bGUgZm9yIHRoZSBuZXh0IHJ1biBvbmx5IGhhcHBlbnMgYWZ0ZXIgdGhlIGN1cnJlbnRcbiAgICogcnVuIGlzIGNvbXBsZXRlZC9mYWlsZWQvdGltZW91dC4gSWYgYSBSZXRyeVBvbGljeSBpcyBhbHNvIHN1cHBsaWVkLCBhbmQgdGhlIFdvcmtmbG93IGZhaWxlZCBvciB0aW1lZCBvdXQsIHRoZVxuICAgKiBXb3JrZmxvdyB3aWxsIGJlIHJldHJpZWQgYmFzZWQgb24gdGhlIHJldHJ5IHBvbGljeS4gV2hpbGUgdGhlIFdvcmtmbG93IGlzIHJldHJ5aW5nLCBpdCB3b24ndCBzY2hlZHVsZSBpdHMgbmV4dCBydW4uXG4gICAqIElmIHRoZSBuZXh0IHNjaGVkdWxlIGlzIGR1ZSB3aGlsZSB0aGUgV29ya2Zsb3cgaXMgcnVubmluZyAob3IgcmV0cnlpbmcpLCB0aGVuIGl0IHdpbGwgc2tpcCB0aGF0IHNjaGVkdWxlLiBDcm9uXG4gICAqIFdvcmtmbG93IHdpbGwgbm90IHN0b3AgdW50aWwgaXQgaXMgdGVybWluYXRlZCBvciBjYW5jZWxsZWQgKGJ5IHJldHVybmluZyB0ZW1wb3JhbC5DYW5jZWxlZEVycm9yKS5cbiAgICogaHR0cHM6Ly9jcm9udGFiLmd1cnUvIGlzIHVzZWZ1bCBmb3IgdGVzdGluZyB5b3VyIGNyb24gZXhwcmVzc2lvbnMuXG4gICAqL1xuICBjcm9uU2NoZWR1bGU/OiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIG5vbi1pbmRleGVkIGluZm9ybWF0aW9uIHRvIGF0dGFjaCB0byB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uLiBUaGUgdmFsdWVzIGNhbiBiZSBhbnl0aGluZyB0aGF0XG4gICAqIGlzIHNlcmlhbGl6YWJsZSBieSB7QGxpbmsgRGF0YUNvbnZlcnRlcn0uXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBhZGRpdGlvbmFsIGluZGV4ZWQgaW5mb3JtYXRpb24gdG8gYXR0YWNoIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24uIE1vcmUgaW5mbzpcbiAgICogaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL2RvY3MvdHlwZXNjcmlwdC9zZWFyY2gtYXR0cmlidXRlc1xuICAgKlxuICAgKiBWYWx1ZXMgYXJlIGFsd2F5cyBjb252ZXJ0ZWQgdXNpbmcge0BsaW5rIEpzb25QYXlsb2FkQ29udmVydGVyfSwgZXZlbiB3aGVuIGEgY3VzdG9tIGRhdGEgY29udmVydGVyIGlzIHByb3ZpZGVkLlxuICAgKi9cbiAgc2VhcmNoQXR0cmlidXRlcz86IFNlYXJjaEF0dHJpYnV0ZXM7XG59XG5cbmV4cG9ydCB0eXBlIFdpdGhXb3JrZmxvd0FyZ3M8VyBleHRlbmRzIFdvcmtmbG93LCBUPiA9IFQgJlxuICAoUGFyYW1ldGVyczxXPiBleHRlbmRzIFthbnksIC4uLmFueVtdXVxuICAgID8ge1xuICAgICAgICAvKipcbiAgICAgICAgICogQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIFdvcmtmbG93XG4gICAgICAgICAqL1xuICAgICAgICBhcmdzOiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9XG4gICAgOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBcmd1bWVudHMgdG8gcGFzcyB0byB0aGUgV29ya2Zsb3dcbiAgICAgICAgICovXG4gICAgICAgIGFyZ3M/OiBQYXJhbWV0ZXJzPFc+IHwgUmVhZG9ubHk8UGFyYW1ldGVyczxXPj47XG4gICAgICB9KTtcblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucyB7XG4gIC8qKlxuICAgKiBUaGUgdGltZSBhZnRlciB3aGljaCB3b3JrZmxvdyBydW4gaXMgYXV0b21hdGljYWxseSB0ZXJtaW5hdGVkIGJ5IFRlbXBvcmFsIHNlcnZpY2UuIERvIG5vdFxuICAgKiByZWx5IG9uIHJ1biB0aW1lb3V0IGZvciBidXNpbmVzcyBsZXZlbCB0aW1lb3V0cy4gSXQgaXMgcHJlZmVycmVkIHRvIHVzZSBpbiB3b3JrZmxvdyB0aW1lcnNcbiAgICogZm9yIHRoaXMgcHVycG9zZS5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1J1blRpbWVvdXQ/OiBEdXJhdGlvbjtcblxuICAvKipcbiAgICpcbiAgICogVGhlIHRpbWUgYWZ0ZXIgd2hpY2ggd29ya2Zsb3cgZXhlY3V0aW9uICh3aGljaCBpbmNsdWRlcyBydW4gcmV0cmllcyBhbmQgY29udGludWUgYXMgbmV3KSBpc1xuICAgKiBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgc2VydmljZS4gRG8gbm90IHJlbHkgb24gZXhlY3V0aW9uIHRpbWVvdXQgZm9yIGJ1c2luZXNzXG4gICAqIGxldmVsIHRpbWVvdXRzLiBJdCBpcyBwcmVmZXJyZWQgdG8gdXNlIGluIHdvcmtmbG93IHRpbWVycyBmb3IgdGhpcyBwdXJwb3NlLlxuICAgKlxuICAgKiBAZm9ybWF0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93RXhlY3V0aW9uVGltZW91dD86IER1cmF0aW9uO1xuXG4gIC8qKlxuICAgKiBNYXhpbXVtIGV4ZWN1dGlvbiB0aW1lIG9mIGEgc2luZ2xlIHdvcmtmbG93IHRhc2suIERlZmF1bHQgaXMgMTAgc2Vjb25kcy5cbiAgICpcbiAgICogQGZvcm1hdCBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIG9yIHtAbGluayBodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9tcyB8IG1zLWZvcm1hdHRlZCBzdHJpbmd9XG4gICAqL1xuICB3b3JrZmxvd1Rhc2tUaW1lb3V0PzogRHVyYXRpb247XG59XG5cbmV4cG9ydCB0eXBlIENvbW1vbldvcmtmbG93T3B0aW9ucyA9IEJhc2VXb3JrZmxvd09wdGlvbnMgJiBXb3JrZmxvd0R1cmF0aW9uT3B0aW9ucztcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RXb3JrZmxvd1R5cGU8VCBleHRlbmRzIFdvcmtmbG93Pih3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ3N0cmluZycpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMgYXMgc3RyaW5nO1xuICBpZiAodHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuYyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh3b3JrZmxvd1R5cGVPckZ1bmM/Lm5hbWUpIHJldHVybiB3b3JrZmxvd1R5cGVPckZ1bmMubmFtZTtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIHdvcmtmbG93IHR5cGU6IHRoZSB3b3JrZmxvdyBmdW5jdGlvbiBpcyBhbm9ueW1vdXMnKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgIGBJbnZhbGlkIHdvcmtmbG93IHR5cGU6IGV4cGVjdGVkIGVpdGhlciBhIHN0cmluZyBvciBhIGZ1bmN0aW9uLCBnb3QgJyR7dHlwZW9mIHdvcmtmbG93VHlwZU9yRnVuY30nYFxuICApO1xufVxuIiwiLy8gQSBwb3J0IG9mIGFuIGFsZ29yaXRobSBieSBKb2hhbm5lcyBCYWFnw7hlIDxiYWFnb2VAYmFhZ29lLmNvbT4sIDIwMTBcbi8vIGh0dHA6Ly9iYWFnb2UuY29tL2VuL1JhbmRvbU11c2luZ3MvamF2YXNjcmlwdC9cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ucXVpbmxhbi9iZXR0ZXItcmFuZG9tLW51bWJlcnMtZm9yLWphdmFzY3JpcHQtbWlycm9yXG4vLyBPcmlnaW5hbCB3b3JrIGlzIHVuZGVyIE1JVCBsaWNlbnNlIC1cblxuLy8gQ29weXJpZ2h0IChDKSAyMDEwIGJ5IEpvaGFubmVzIEJhYWfDuGUgPGJhYWdvZUBiYWFnb2Uub3JnPlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIFRha2VuIGFuZCBtb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kYXZpZGJhdS9zZWVkcmFuZG9tL2Jsb2IvcmVsZWFzZWQvbGliL2FsZWEuanNcblxuY2xhc3MgQWxlYSB7XG4gIHB1YmxpYyBjOiBudW1iZXI7XG4gIHB1YmxpYyBzMDogbnVtYmVyO1xuICBwdWJsaWMgczE6IG51bWJlcjtcbiAgcHVibGljIHMyOiBudW1iZXI7XG5cbiAgY29uc3RydWN0b3Ioc2VlZDogbnVtYmVyW10pIHtcbiAgICBjb25zdCBtYXNoID0gbmV3IE1hc2goKTtcbiAgICAvLyBBcHBseSB0aGUgc2VlZGluZyBhbGdvcml0aG0gZnJvbSBCYWFnb2UuXG4gICAgdGhpcy5jID0gMTtcbiAgICB0aGlzLnMwID0gbWFzaC5tYXNoKFszMl0pO1xuICAgIHRoaXMuczEgPSBtYXNoLm1hc2goWzMyXSk7XG4gICAgdGhpcy5zMiA9IG1hc2gubWFzaChbMzJdKTtcbiAgICB0aGlzLnMwIC09IG1hc2gubWFzaChzZWVkKTtcbiAgICBpZiAodGhpcy5zMCA8IDApIHtcbiAgICAgIHRoaXMuczAgKz0gMTtcbiAgICB9XG4gICAgdGhpcy5zMSAtPSBtYXNoLm1hc2goc2VlZCk7XG4gICAgaWYgKHRoaXMuczEgPCAwKSB7XG4gICAgICB0aGlzLnMxICs9IDE7XG4gICAgfVxuICAgIHRoaXMuczIgLT0gbWFzaC5tYXNoKHNlZWQpO1xuICAgIGlmICh0aGlzLnMyIDwgMCkge1xuICAgICAgdGhpcy5zMiArPSAxO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBuZXh0KCk6IG51bWJlciB7XG4gICAgY29uc3QgdCA9IDIwOTE2MzkgKiB0aGlzLnMwICsgdGhpcy5jICogMi4zMjgzMDY0MzY1Mzg2OTYzZS0xMDsgLy8gMl4tMzJcbiAgICB0aGlzLnMwID0gdGhpcy5zMTtcbiAgICB0aGlzLnMxID0gdGhpcy5zMjtcbiAgICByZXR1cm4gKHRoaXMuczIgPSB0IC0gKHRoaXMuYyA9IHQgfCAwKSk7XG4gIH1cbn1cblxuZXhwb3J0IHR5cGUgUk5HID0gKCkgPT4gbnVtYmVyO1xuXG5leHBvcnQgZnVuY3Rpb24gYWxlYShzZWVkOiBudW1iZXJbXSk6IFJORyB7XG4gIGNvbnN0IHhnID0gbmV3IEFsZWEoc2VlZCk7XG4gIHJldHVybiB4Zy5uZXh0LmJpbmQoeGcpO1xufVxuXG5leHBvcnQgY2xhc3MgTWFzaCB7XG4gIHByaXZhdGUgbiA9IDB4ZWZjODI0OWQ7XG5cbiAgcHVibGljIG1hc2goZGF0YTogbnVtYmVyW10pOiBudW1iZXIge1xuICAgIGxldCB7IG4gfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBkYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICBuICs9IGRhdGFbaV07XG4gICAgICBsZXQgaCA9IDAuMDI1MTk2MDMyODI0MTY5MzggKiBuO1xuICAgICAgbiA9IGggPj4+IDA7XG4gICAgICBoIC09IG47XG4gICAgICBoICo9IG47XG4gICAgICBuID0gaCA+Pj4gMDtcbiAgICAgIGggLT0gbjtcbiAgICAgIG4gKz0gaCAqIDB4MTAwMDAwMDAwOyAvLyAyXjMyXG4gICAgfVxuICAgIHRoaXMubiA9IG47XG4gICAgcmV0dXJuIChuID4+PiAwKSAqIDIuMzI4MzA2NDM2NTM4Njk2M2UtMTA7IC8vIDJeLTMyXG4gIH1cbn1cbiIsImltcG9ydCB0eXBlIHsgQXN5bmNMb2NhbFN0b3JhZ2UgYXMgQUxTIH0gZnJvbSAnbm9kZTphc3luY19ob29rcyc7XG5pbXBvcnQgeyBDYW5jZWxsZWRGYWlsdXJlLCBEdXJhdGlvbiwgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuXG4vLyBBc3luY0xvY2FsU3RvcmFnZSBpcyBpbmplY3RlZCB2aWEgdm0gbW9kdWxlIGludG8gZ2xvYmFsIHNjb3BlLlxuLy8gSW4gY2FzZSBXb3JrZmxvdyBjb2RlIGlzIGltcG9ydGVkIGluIE5vZGUuanMgY29udGV4dCwgcmVwbGFjZSB3aXRoIGFuIGVtcHR5IGNsYXNzLlxuZXhwb3J0IGNvbnN0IEFzeW5jTG9jYWxTdG9yYWdlOiBuZXcgPFQ+KCkgPT4gQUxTPFQ+ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5Bc3luY0xvY2FsU3RvcmFnZSA/PyBjbGFzcyB7fTtcblxuLyoqIE1hZ2ljIHN5bWJvbCB1c2VkIHRvIGNyZWF0ZSB0aGUgcm9vdCBzY29wZSAtIGludGVudGlvbmFsbHkgbm90IGV4cG9ydGVkICovXG5jb25zdCBOT19QQVJFTlQgPSBTeW1ib2woJ05PX1BBUkVOVCcpO1xuXG4vKipcbiAqIE9wdGlvbiBmb3IgY29uc3RydWN0aW5nIGEgQ2FuY2VsbGF0aW9uU2NvcGVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDYW5jZWxsYXRpb25TY29wZU9wdGlvbnMge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHRpbWVvdXQ/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIElmIGZhbHNlLCBwcmV2ZW50IG91dGVyIGNhbmNlbGxhdGlvbiBmcm9tIHByb3BhZ2F0aW5nIHRvIGlubmVyIHNjb3BlcywgQWN0aXZpdGllcywgdGltZXJzLCBhbmQgVHJpZ2dlcnMsIGRlZmF1bHRzIHRvIHRydWUuXG4gICAqIChTY29wZSBzdGlsbCBwcm9wYWdhdGVzIENhbmNlbGxlZEZhaWx1cmUgdGhyb3duIGZyb20gd2l0aGluKS5cbiAgICovXG4gIGNhbmNlbGxhYmxlOiBib29sZWFuO1xuICAvKipcbiAgICogQW4gb3B0aW9uYWwgQ2FuY2VsbGF0aW9uU2NvcGUgKHVzZWZ1bCBmb3IgcnVubmluZyBiYWNrZ3JvdW5kIHRhc2tzKS5cbiAgICogVGhlIGBOT19QQVJFTlRgIHN5bWJvbCBpcyByZXNlcnZlZCBmb3IgdGhlIHJvb3Qgc2NvcGUuXG4gICAqL1xuICBwYXJlbnQ/OiBDYW5jZWxsYXRpb25TY29wZSB8IHR5cGVvZiBOT19QQVJFTlQ7XG59XG5cbi8qKlxuICogSW4gdGhlIFNESywgV29ya2Zsb3dzIGFyZSByZXByZXNlbnRlZCBpbnRlcm5hbGx5IGJ5IGEgdHJlZSBvZiBzY29wZXMgd2hlcmUgdGhlIGBleGVjdXRlYCBmdW5jdGlvbiBydW5zIGluIHRoZSByb290IHNjb3BlLlxuICogQ2FuY2VsbGF0aW9uIHByb3BhZ2F0ZXMgZnJvbSBvdXRlciBzY29wZXMgdG8gaW5uZXIgb25lcyBhbmQgaXMgaGFuZGxlZCBieSBjYXRjaGluZyB7QGxpbmsgQ2FuY2VsbGVkRmFpbHVyZX1zXG4gKiB0aHJvd24gYnkgY2FuY2VsbGFibGUgb3BlcmF0aW9ucyAoc2VlIGJlbG93KS5cbiAqXG4gKiBTY29wZXMgYXJlIGNyZWF0ZWQgdXNpbmcgdGhlIGBDYW5jZWxsYXRpb25TY29wZWAgY29uc3RydWN0b3Igb3IgdGhlIHN0YXRpYyBoZWxwZXIgbWV0aG9kc1xuICoge0BsaW5rIGNhbmNlbGxhYmxlfSwge0BsaW5rIG5vbkNhbmNlbGxhYmxlfSBhbmQge0BsaW5rIHdpdGhUaW1lb3V0fS5cbiAqXG4gKiBXaGVuIGEgYENhbmNlbGxhdGlvblNjb3BlYCBpcyBjYW5jZWxsZWQsIGl0IHdpbGwgcHJvcGFnYXRlIGNhbmNlbGxhdGlvbiBhbnkgY2hpbGQgc2NvcGVzIGFuZCBhbnkgY2FuY2VsbGFibGVcbiAqIG9wZXJhdGlvbnMgY3JlYXRlZCB3aXRoaW4gaXQsIHN1Y2ggYXM6XG4gKlxuICogLSBBY3Rpdml0aWVzXG4gKiAtIENoaWxkIFdvcmtmbG93c1xuICogLSBUaW1lcnMgKGNyZWF0ZWQgd2l0aCB0aGUge0BsaW5rIHNsZWVwfSBmdW5jdGlvbilcbiAqIC0ge0BsaW5rIFRyaWdnZXJ9c1xuICpcbiAqIEBleGFtcGxlXG4gKlxuICogYGBgdHNcbiAqIGF3YWl0IENhbmNlbGxhdGlvblNjb3BlLmNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAqICAgY29uc3QgcHJvbWlzZSA9IHNvbWVBY3Rpdml0eSgpO1xuICogICBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCkuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiAgIGF3YWl0IHByb21pc2U7IC8vIFRocm93cyBgQWN0aXZpdHlGYWlsdXJlYCB3aXRoIGBjYXVzZWAgc2V0IHRvIGBDYW5jZWxsZWRGYWlsdXJlYFxuICogfSk7XG4gKiBgYGBcbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBjb25zdCBzY29wZSA9IG5ldyBDYW5jZWxsYXRpb25TY29wZSgpO1xuICogY29uc3QgcHJvbWlzZSA9IHNjb3BlLnJ1bihzb21lQWN0aXZpdHkpO1xuICogc2NvcGUuY2FuY2VsKCk7IC8vIENhbmNlbHMgdGhlIGFjdGl2aXR5XG4gKiBhd2FpdCBwcm9taXNlOyAvLyBUaHJvd3MgYEFjdGl2aXR5RmFpbHVyZWAgd2l0aCBgY2F1c2VgIHNldCB0byBgQ2FuY2VsbGVkRmFpbHVyZWBcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAvKipcbiAgICogVGltZSBpbiBtaWxsaXNlY29uZHMgYmVmb3JlIHRoZSBzY29wZSBjYW5jZWxsYXRpb24gaXMgYXV0b21hdGljYWxseSByZXF1ZXN0ZWRcbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSB0aW1lb3V0PzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBJZiBmYWxzZSwgcHJldmVudCBvdXRlciBjYW5jZWxsYXRpb24gZnJvbSBwcm9wYWdhdGluZyB0byBpbm5lciBzY29wZXMsIEFjdGl2aXRpZXMsIHRpbWVycywgYW5kIFRyaWdnZXJzLCBkZWZhdWx0cyB0byB0cnVlLlxuICAgKiAoU2NvcGUgc3RpbGwgcHJvcGFnYXRlcyBDYW5jZWxsZWRGYWlsdXJlIHRocm93biBmcm9tIHdpdGhpbilcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBjYW5jZWxsYWJsZTogYm9vbGVhbjtcbiAgLyoqXG4gICAqIEFuIG9wdGlvbmFsIENhbmNlbGxhdGlvblNjb3BlICh1c2VmdWwgZm9yIHJ1bm5pbmcgYmFja2dyb3VuZCB0YXNrcyksIGRlZmF1bHRzIHRvIHtAbGluayBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50fSgpXG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkgcGFyZW50PzogQ2FuY2VsbGF0aW9uU2NvcGU7XG5cbiAgLyoqXG4gICAqIFJlamVjdGVkIHdoZW4gc2NvcGUgY2FuY2VsbGF0aW9uIGlzIHJlcXVlc3RlZFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGNhbmNlbFJlcXVlc3RlZDogUHJvbWlzZTxuZXZlcj47XG5cbiAgI2NhbmNlbFJlcXVlc3RlZCA9IGZhbHNlO1xuXG4gIC8vIFR5cGVzY3JpcHQgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IHRoZSBQcm9taXNlIGV4ZWN1dG9yIHJ1bnMgc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHByb3RlY3RlZCByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucz86IENhbmNlbGxhdGlvblNjb3BlT3B0aW9ucykge1xuICAgIHRoaXMudGltZW91dCA9IG9wdGlvbnM/LnRpbWVvdXQ7XG4gICAgdGhpcy5jYW5jZWxsYWJsZSA9IG9wdGlvbnM/LmNhbmNlbGxhYmxlID8/IHRydWU7XG4gICAgdGhpcy5jYW5jZWxSZXF1ZXN0ZWQgPSBuZXcgUHJvbWlzZSgoXywgcmVqZWN0KSA9PiB7XG4gICAgICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHVuZGVyc3RhbmQgdGhhdCB0aGUgUHJvbWlzZSBleGVjdXRvciBydW5zIHN5bmNocm9ub3VzbHlcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVqZWN0ID0gKGVycikgPT4ge1xuICAgICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0cnVlO1xuICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgIH07XG4gICAgfSk7XG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQpO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4gdW5kZWZpbmVkKSk7XG4gICAgaWYgKG9wdGlvbnM/LnBhcmVudCAhPT0gTk9fUEFSRU5UKSB7XG4gICAgICB0aGlzLnBhcmVudCA9IG9wdGlvbnM/LnBhcmVudCB8fCBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgICB0aGlzLiNjYW5jZWxSZXF1ZXN0ZWQgPSB0aGlzLnBhcmVudC4jY2FuY2VsUmVxdWVzdGVkO1xuICAgICAgdGhpcy5wYXJlbnQuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgdGhpcy5yZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBnZXQgY29uc2lkZXJlZENhbmNlbGxlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy4jY2FuY2VsUmVxdWVzdGVkICYmIHRoaXMuY2FuY2VsbGFibGU7XG4gIH1cbiAgLyoqXG4gICAqIEFjdGl2YXRlIHRoZSBzY29wZSBhcyBjdXJyZW50IGFuZCBydW4gIGBmbmBcbiAgICpcbiAgICogQW55IHRpbWVycywgQWN0aXZpdGllcywgVHJpZ2dlcnMgYW5kIENhbmNlbGxhdGlvblNjb3BlcyBjcmVhdGVkIGluIHRoZSBib2R5IG9mIGBmbmBcbiAgICogYXV0b21hdGljYWxseSBsaW5rIHRoZWlyIGNhbmNlbGxhdGlvbiB0byB0aGlzIHNjb3BlLlxuICAgKlxuICAgKiBAcmV0dXJuIHRoZSByZXN1bHQgb2YgYGZuYFxuICAgKi9cbiAgcnVuPFQ+KGZuOiAoKSA9PiBQcm9taXNlPFQ+KTogUHJvbWlzZTxUPiB7XG4gICAgcmV0dXJuIHN0b3JhZ2UucnVuKHRoaXMsIHRoaXMucnVuSW5Db250ZXh0LmJpbmQodGhpcywgZm4pIGFzICgpID0+IFByb21pc2U8VD4pO1xuICB9XG5cbiAgLyoqXG4gICAqIE1ldGhvZCB0aGF0IHJ1bnMgYSBmdW5jdGlvbiBpbiBBc3luY0xvY2FsU3RvcmFnZSBjb250ZXh0LlxuICAgKlxuICAgKiBDb3VsZCBoYXZlIGJlZW4gd3JpdHRlbiBhcyBhbm9ueW1vdXMgZnVuY3Rpb24sIG1hZGUgaW50byBhIG1ldGhvZCBmb3IgaW1wcm92ZWQgc3RhY2sgdHJhY2VzLlxuICAgKi9cbiAgcHJvdGVjdGVkIGFzeW5jIHJ1bkluQ29udGV4dDxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIGlmICh0aGlzLnRpbWVvdXQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzbGVlcCh0aGlzLnRpbWVvdXQpLnRoZW4oXG4gICAgICAgICAgKCkgPT4gdGhpcy5jYW5jZWwoKSxcbiAgICAgICAgICAoKSA9PiB7XG4gICAgICAgICAgICAvLyBzY29wZSB3YXMgYWxyZWFkeSBjYW5jZWxsZWQsIGlnbm9yZVxuICAgICAgICAgIH1cbiAgICAgICAgKVxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IGZuKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVxdWVzdCB0byBjYW5jZWwgdGhlIHNjb3BlIGFuZCBsaW5rZWQgY2hpbGRyZW5cbiAgICovXG4gIGNhbmNlbCgpOiB2b2lkIHtcbiAgICB0aGlzLnJlamVjdChuZXcgQ2FuY2VsbGVkRmFpbHVyZSgnQ2FuY2VsbGF0aW9uIHNjb3BlIGNhbmNlbGxlZCcpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGN1cnJlbnQgXCJhY3RpdmVcIiBzY29wZVxuICAgKi9cbiAgc3RhdGljIGN1cnJlbnQoKTogQ2FuY2VsbGF0aW9uU2NvcGUge1xuICAgIC8vIFVzaW5nIGdsb2JhbHMgZGlyZWN0bHkgaW5zdGVhZCBvZiBhIGhlbHBlciBmdW5jdGlvbiB0byBhdm9pZCBjaXJjdWxhciBpbXBvcnRcbiAgICByZXR1cm4gc3RvcmFnZS5nZXRTdG9yZSgpID8/IChnbG9iYWxUaGlzIGFzIGFueSkuX19URU1QT1JBTF9BQ1RJVkFUT1JfXy5yb290U2NvcGU7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbilgICovXG4gIHN0YXRpYyBjYW5jZWxsYWJsZTxUPihmbjogKCkgPT4gUHJvbWlzZTxUPik6IFByb21pc2U8VD4ge1xuICAgIHJldHVybiBuZXcgdGhpcyh7IGNhbmNlbGxhYmxlOiB0cnVlIH0pLnJ1bihmbik7XG4gIH1cblxuICAvKiogQWxpYXMgdG8gYG5ldyBDYW5jZWxsYXRpb25TY29wZSh7IGNhbmNlbGxhYmxlOiBmYWxzZSB9KS5ydW4oZm4pYCAqL1xuICBzdGF0aWMgbm9uQ2FuY2VsbGFibGU8VD4oZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogZmFsc2UgfSkucnVuKGZuKTtcbiAgfVxuXG4gIC8qKiBBbGlhcyB0byBgbmV3IENhbmNlbGxhdGlvblNjb3BlKHsgY2FuY2VsbGFibGU6IHRydWUsIHRpbWVvdXQgfSkucnVuKGZuKWAgKi9cbiAgc3RhdGljIHdpdGhUaW1lb3V0PFQ+KHRpbWVvdXQ6IG51bWJlciwgZm46ICgpID0+IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gbmV3IHRoaXMoeyBjYW5jZWxsYWJsZTogdHJ1ZSwgdGltZW91dCB9KS5ydW4oZm4pO1xuICB9XG59XG5cbmNvbnN0IHN0b3JhZ2UgPSBuZXcgQXN5bmNMb2NhbFN0b3JhZ2U8Q2FuY2VsbGF0aW9uU2NvcGU+KCk7XG5cbi8qKlxuICogQXZvaWQgZXhwb3NpbmcgdGhlIHN0b3JhZ2UgZGlyZWN0bHkgc28gaXQgZG9lc24ndCBnZXQgZnJvemVuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXNhYmxlU3RvcmFnZSgpOiB2b2lkIHtcbiAgc3RvcmFnZS5kaXNhYmxlKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgZXh0ZW5kcyBDYW5jZWxsYXRpb25TY29wZSB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKHsgY2FuY2VsbGFibGU6IHRydWUsIHBhcmVudDogTk9fUEFSRU5UIH0pO1xuICB9XG5cbiAgY2FuY2VsKCk6IHZvaWQge1xuICAgIHRoaXMucmVqZWN0KG5ldyBDYW5jZWxsZWRGYWlsdXJlKCdXb3JrZmxvdyBjYW5jZWxsZWQnKSk7XG4gIH1cbn1cblxuLyoqIFRoaXMgZnVuY3Rpb24gaXMgaGVyZSB0byBhdm9pZCBhIGNpcmN1bGFyIGRlcGVuZGVuY3kgYmV0d2VlbiB0aGlzIG1vZHVsZSBhbmQgd29ya2Zsb3cudHMgKi9cbmxldCBzbGVlcCA9IChfOiBEdXJhdGlvbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IGhhcyBub3QgYmVlbiBwcm9wZXJseSBpbml0aWFsaXplZCcpO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbihmbjogdHlwZW9mIHNsZWVwKTogdm9pZCB7XG4gIHNsZWVwID0gZm47XG59XG4iLCJpbXBvcnQgeyBBY3Rpdml0eUZhaWx1cmUsIENhbmNlbGxlZEZhaWx1cmUsIENoaWxkV29ya2Zsb3dGYWlsdXJlIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHsgY29yZXNkayB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBhbGwgd29ya2Zsb3cgZXJyb3JzXG4gKi9cbkBTeW1ib2xCYXNlZEluc3RhbmNlT2ZFcnJvcignV29ya2Zsb3dFcnJvcicpXG5leHBvcnQgY2xhc3MgV29ya2Zsb3dFcnJvciBleHRlbmRzIEVycm9yIHt9XG5cbi8qKlxuICogVGhyb3duIGluIHdvcmtmbG93IHdoZW4gaXQgdHJpZXMgdG8gZG8gc29tZXRoaW5nIHRoYXQgbm9uLWRldGVybWluaXN0aWMgc3VjaCBhcyBjb25zdHJ1Y3QgYSBXZWFrUmVmKClcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yJylcbmV4cG9ydCBjbGFzcyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yIGV4dGVuZHMgV29ya2Zsb3dFcnJvciB7fVxuXG4vKipcbiAqIEEgY2xhc3MgdGhhdCBhY3RzIGFzIGEgbWFya2VyIGZvciB0aGlzIHNwZWNpYWwgcmVzdWx0IHR5cGVcbiAqL1xuQFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yKCdMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmJylcbmV4cG9ydCBjbGFzcyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcmVhZG9ubHkgYmFja29mZjogY29yZXNkay5hY3Rpdml0eV9yZXN1bHQuSURvQmFja29mZikge1xuICAgIHN1cGVyKCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgcHJvdmlkZWQgYGVycmAgaXMgY2F1c2VkIGJ5IGNhbmNlbGxhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNDYW5jZWxsYXRpb24oZXJyOiB1bmtub3duKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgZXJyIGluc3RhbmNlb2YgQ2FuY2VsbGVkRmFpbHVyZSB8fFxuICAgICgoZXJyIGluc3RhbmNlb2YgQWN0aXZpdHlGYWlsdXJlIHx8IGVyciBpbnN0YW5jZW9mIENoaWxkV29ya2Zsb3dGYWlsdXJlKSAmJiBlcnIuY2F1c2UgaW5zdGFuY2VvZiBDYW5jZWxsZWRGYWlsdXJlKVxuICApO1xufVxuIiwiaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgdHlwZSBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKTogdW5rbm93biB7XG4gIHJldHVybiAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX187XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRBY3RpdmF0b3JVbnR5cGVkKGFjdGl2YXRvcjogdW5rbm93bik6IHZvaWQge1xuICAoZ2xvYmFsVGhpcyBhcyBhbnkpLl9fVEVNUE9SQUxfQUNUSVZBVE9SX18gPSBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYXliZUdldEFjdGl2YXRvcigpOiBBY3RpdmF0b3IgfCB1bmRlZmluZWQge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3JVbnR5cGVkKCkgYXMgQWN0aXZhdG9yIHwgdW5kZWZpbmVkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQobWVzc2FnZTogc3RyaW5nKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PSBudWxsKSB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IobWVzc2FnZSk7XG4gIHJldHVybiBhY3RpdmF0b3I7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRBY3RpdmF0b3IoKTogQWN0aXZhdG9yIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gbWF5YmVHZXRBY3RpdmF0b3IoKTtcbiAgaWYgKGFjdGl2YXRvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyB1bmluaXRpYWxpemVkJyk7XG4gIH1cbiAgcmV0dXJuIGFjdGl2YXRvcjtcbn1cbiIsIi8qKlxuICogVGhpcyBsaWJyYXJ5IHByb3ZpZGVzIHRvb2xzIHJlcXVpcmVkIGZvciBhdXRob3Jpbmcgd29ya2Zsb3dzLlxuICpcbiAqICMjIFVzYWdlXG4gKiBTZWUgdGhlIHtAbGluayBodHRwczovL2RvY3MudGVtcG9yYWwuaW8vdHlwZXNjcmlwdC9oZWxsby13b3JsZCN3b3JrZmxvd3MgfCB0dXRvcmlhbH0gZm9yIHdyaXRpbmcgeW91ciBmaXJzdCB3b3JrZmxvdy5cbiAqXG4gKiAjIyMgVGltZXJzXG4gKlxuICogVGhlIHJlY29tbWVuZGVkIHdheSBvZiBzY2hlZHVsaW5nIHRpbWVycyBpcyBieSB1c2luZyB0aGUge0BsaW5rIHNsZWVwfSBmdW5jdGlvbi4gV2UndmUgcmVwbGFjZWQgYHNldFRpbWVvdXRgIGFuZFxuICogYGNsZWFyVGltZW91dGAgd2l0aCBkZXRlcm1pbmlzdGljIHZlcnNpb25zIHNvIHRoZXNlIGFyZSBhbHNvIHVzYWJsZSBidXQgaGF2ZSBhIGxpbWl0YXRpb24gdGhhdCB0aGV5IGRvbid0IHBsYXkgd2VsbFxuICogd2l0aCB7QGxpbmsgaHR0cHM6Ly9kb2NzLnRlbXBvcmFsLmlvL3R5cGVzY3JpcHQvY2FuY2VsbGF0aW9uLXNjb3BlcyB8IGNhbmNlbGxhdGlvbiBzY29wZXN9LlxuICpcbiAqIDwhLS1TTklQU1RBUlQgdHlwZXNjcmlwdC1zbGVlcC13b3JrZmxvdy0tPlxuICogPCEtLVNOSVBFTkQtLT5cbiAqXG4gKiAjIyMgQWN0aXZpdGllc1xuICpcbiAqIFRvIHNjaGVkdWxlIEFjdGl2aXRpZXMsIHVzZSB7QGxpbmsgcHJveHlBY3Rpdml0aWVzfSB0byBvYnRhaW4gYW4gQWN0aXZpdHkgZnVuY3Rpb24gYW5kIGNhbGwuXG4gKlxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXNjaGVkdWxlLWFjdGl2aXR5LXdvcmtmbG93LS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBVcGRhdGVzLCBTaWduYWxzIGFuZCBRdWVyaWVzXG4gKlxuICogVXNlIHtAbGluayBzZXRIYW5kbGVyfSB0byBzZXQgaGFuZGxlcnMgZm9yIFVwZGF0ZXMsIFNpZ25hbHMsIGFuZCBRdWVyaWVzLlxuICpcbiAqIFVwZGF0ZSBhbmQgU2lnbmFsIGhhbmRsZXJzIGNhbiBiZSBlaXRoZXIgYXN5bmMgb3Igbm9uLWFzeW5jIGZ1bmN0aW9ucy4gVXBkYXRlIGhhbmRsZXJzIG1heSByZXR1cm4gYSB2YWx1ZSwgYnV0IHNpZ25hbFxuICogaGFuZGxlcnMgbWF5IG5vdCAocmV0dXJuIGB2b2lkYCBvciBgUHJvbWlzZTx2b2lkPmApLiBZb3UgbWF5IHVzZSBBY3Rpdml0aWVzLCBUaW1lcnMsIGNoaWxkIFdvcmtmbG93cywgZXRjIGluIFVwZGF0ZVxuICogYW5kIFNpZ25hbCBoYW5kbGVycywgYnV0IHRoaXMgc2hvdWxkIGJlIGRvbmUgY2F1dGlvdXNseTogZm9yIGV4YW1wbGUsIG5vdGUgdGhhdCBpZiB5b3UgYXdhaXQgYXN5bmMgb3BlcmF0aW9ucyBzdWNoIGFzXG4gKiB0aGVzZSBpbiBhbiBVcGRhdGUgb3IgU2lnbmFsIGhhbmRsZXIsIHRoZW4geW91IGFyZSByZXNwb25zaWJsZSBmb3IgZW5zdXJpbmcgdGhhdCB0aGUgd29ya2Zsb3cgZG9lcyBub3QgY29tcGxldGUgZmlyc3QuXG4gKlxuICogUXVlcnkgaGFuZGxlcnMgbWF5ICoqbm90KiogYmUgYXN5bmMgZnVuY3Rpb25zLCBhbmQgbWF5ICoqbm90KiogbXV0YXRlIGFueSB2YXJpYWJsZXMgb3IgdXNlIEFjdGl2aXRpZXMsIFRpbWVycyxcbiAqIGNoaWxkIFdvcmtmbG93cywgZXRjLlxuICpcbiAqICMjIyMgSW1wbGVtZW50YXRpb25cbiAqXG4gKiA8IS0tU05JUFNUQVJUIHR5cGVzY3JpcHQtd29ya2Zsb3ctdXBkYXRlLXNpZ25hbC1xdWVyeS1leGFtcGxlLS0+XG4gKiA8IS0tU05JUEVORC0tPlxuICpcbiAqICMjIyBNb3JlXG4gKlxuICogLSBbRGV0ZXJtaW5pc3RpYyBidWlsdC1pbnNdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2RldGVybWluaXNtI3NvdXJjZXMtb2Ytbm9uLWRldGVybWluaXNtKVxuICogLSBbQ2FuY2VsbGF0aW9uIGFuZCBzY29wZXNdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L2NhbmNlbGxhdGlvbi1zY29wZXMpXG4gKiAgIC0ge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfVxuICogICAtIHtAbGluayBUcmlnZ2VyfVxuICogLSBbU2lua3NdKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9hcHBsaWNhdGlvbi1kZXZlbG9wbWVudC9vYnNlcnZhYmlsaXR5Lz9sYW5nPXRzI2xvZ2dpbmcpXG4gKiAgIC0ge0BsaW5rIFNpbmtzfVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQge1xuICBBY3Rpdml0eUNhbmNlbGxhdGlvblR5cGUsXG4gIEFjdGl2aXR5RmFpbHVyZSxcbiAgQWN0aXZpdHlPcHRpb25zLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG4gIENhbmNlbGxlZEZhaWx1cmUsXG4gIENoaWxkV29ya2Zsb3dGYWlsdXJlLFxuICBkZWZhdWx0UGF5bG9hZENvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgUmV0cnlQb2xpY3ksXG4gIHJvb3RDYXVzZSxcbiAgU2VydmVyRmFpbHVyZSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBUZXJtaW5hdGVkRmFpbHVyZSxcbiAgVGltZW91dEZhaWx1cmUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5leHBvcnQgKiBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2Vycm9ycyc7XG5leHBvcnQge1xuICBBY3Rpdml0eUZ1bmN0aW9uLFxuICBBY3Rpdml0eUludGVyZmFjZSwgLy8gZXNsaW50LWRpc2FibGUtbGluZSBkZXByZWNhdGlvbi9kZXByZWNhdGlvblxuICBQYXlsb2FkLFxuICBRdWVyeURlZmluaXRpb24sXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNlYXJjaEF0dHJpYnV0ZVZhbHVlLFxuICBTaWduYWxEZWZpbml0aW9uLFxuICBVbnR5cGVkQWN0aXZpdGllcyxcbiAgV29ya2Zsb3csXG4gIFdvcmtmbG93UXVlcnlUeXBlLFxuICBXb3JrZmxvd1Jlc3VsdFR5cGUsXG4gIFdvcmtmbG93UmV0dXJuVHlwZSxcbiAgV29ya2Zsb3dTaWduYWxUeXBlLFxufSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyZmFjZXMnO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi93b3JrZmxvdy1oYW5kbGUnO1xuZXhwb3J0ICogZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi93b3JrZmxvdy1vcHRpb25zJztcbmV4cG9ydCB7IEFzeW5jTG9jYWxTdG9yYWdlLCBDYW5jZWxsYXRpb25TY29wZSwgQ2FuY2VsbGF0aW9uU2NvcGVPcHRpb25zIH0gZnJvbSAnLi9jYW5jZWxsYXRpb24tc2NvcGUnO1xuZXhwb3J0ICogZnJvbSAnLi9lcnJvcnMnO1xuZXhwb3J0ICogZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuZXhwb3J0IHtcbiAgQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsXG4gIENoaWxkV29ya2Zsb3dPcHRpb25zLFxuICBDb250aW51ZUFzTmV3LFxuICBDb250aW51ZUFzTmV3T3B0aW9ucyxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBGaWxlTG9jYXRpb24sXG4gIEZpbGVTbGljZSxcbiAgUGFyZW50Q2xvc2VQb2xpY3ksXG4gIFBhcmVudFdvcmtmbG93SW5mbyxcbiAgU0RLSW5mbyxcbiAgU3RhY2tUcmFjZSxcbiAgVW5zYWZlV29ya2Zsb3dJbmZvLFxuICBXb3JrZmxvd0luZm8sXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5leHBvcnQgeyBwcm94eVNpbmtzLCBTaW5rLCBTaW5rQ2FsbCwgU2lua0Z1bmN0aW9uLCBTaW5rcyB9IGZyb20gJy4vc2lua3MnO1xuZXhwb3J0IHsgbG9nIH0gZnJvbSAnLi9sb2dzJztcbmV4cG9ydCB7IFRyaWdnZXIgfSBmcm9tICcuL3RyaWdnZXInO1xuZXhwb3J0ICogZnJvbSAnLi93b3JrZmxvdyc7XG5leHBvcnQgeyBDaGlsZFdvcmtmbG93SGFuZGxlLCBFeHRlcm5hbFdvcmtmbG93SGFuZGxlIH0gZnJvbSAnLi93b3JrZmxvdy1oYW5kbGUnO1xuXG4vLyBBbnl0aGluZyBiZWxvdyB0aGlzIGxpbmUgaXMgZGVwcmVjYXRlZFxuXG5leHBvcnQge1xuICAvKipcbiAgICogQGRlcHJlY2F0ZWQgRG8gbm90IHVzZSBMb2dnZXJTaW5rcyBkaXJlY3RseS4gVG8gbG9nIGZyb20gV29ya2Zsb3cgY29kZSwgdXNlIHRoZSBgbG9nYCBvYmplY3RcbiAgICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICAgKiAgICAgICAgICAgICBieSBXb3JrZmxvdyBjb2RlLCBzZXQgdGhlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gcHJvcGVydHkuXG4gICAqL1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgZGVwcmVjYXRpb24vZGVwcmVjYXRpb25cbiAgTG9nZ2VyU2lua3NEZXByZWNhdGVkIGFzIExvZ2dlclNpbmtzLFxufSBmcm9tICcuL2xvZ3MnO1xuIiwiLyoqXG4gKiBUeXBlIGRlZmluaXRpb25zIGFuZCBnZW5lcmljIGhlbHBlcnMgZm9yIGludGVyY2VwdG9ycy5cbiAqXG4gKiBUaGUgV29ya2Zsb3cgc3BlY2lmaWMgaW50ZXJjZXB0b3JzIGFyZSBkZWZpbmVkIGhlcmUuXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IEFjdGl2aXR5T3B0aW9ucywgSGVhZGVycywgTG9jYWxBY3Rpdml0eU9wdGlvbnMsIE5leHQsIFRpbWVzdGFtcCwgV29ya2Zsb3dFeGVjdXRpb24gfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsIENvbnRpbnVlQXNOZXdPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcblxuZXhwb3J0IHsgTmV4dCwgSGVhZGVycyB9O1xuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuZXhlY3V0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0V4ZWN1dGVJbnB1dCB7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVVwZGF0ZSBhbmRcbiAqIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IudmFsaWRhdGVVcGRhdGUgKi9cbmV4cG9ydCBpbnRlcmZhY2UgVXBkYXRlSW5wdXQge1xuICByZWFkb25seSB1cGRhdGVJZDogc3RyaW5nO1xuICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0luYm91bmRDYWxsc0ludGVyY2VwdG9yLmhhbmRsZVNpZ25hbCAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxJbnB1dCB7XG4gIHJlYWRvbmx5IHNpZ25hbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3IuaGFuZGxlUXVlcnkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlJbnB1dCB7XG4gIHJlYWRvbmx5IHF1ZXJ5SWQ6IHN0cmluZztcbiAgcmVhZG9ubHkgcXVlcnlOYW1lOiBzdHJpbmc7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbn1cblxuLyoqXG4gKiBJbXBsZW1lbnQgYW55IG9mIHRoZXNlIG1ldGhvZHMgdG8gaW50ZXJjZXB0IFdvcmtmbG93IGluYm91bmQgY2FsbHMgbGlrZSBleGVjdXRpb24sIGFuZCBzaWduYWwgYW5kIHF1ZXJ5IGhhbmRsaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW5ib3VuZENhbGxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgZXhlY3V0ZSBtZXRob2QgaXMgY2FsbGVkXG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBXb3JrZmxvdyBleGVjdXRpb25cbiAgICovXG4gIGV4ZWN1dGU/OiAoaW5wdXQ6IFdvcmtmbG93RXhlY3V0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdleGVjdXRlJz4pID0+IFByb21pc2U8dW5rbm93bj47XG5cbiAgLyoqIENhbGxlZCB3aGVuIFVwZGF0ZSBoYW5kbGVyIGlzIGNhbGxlZFxuICAgKlxuICAgKiBAcmV0dXJuIHJlc3VsdCBvZiB0aGUgVXBkYXRlXG4gICAqL1xuICBoYW5kbGVVcGRhdGU/OiAoaW5wdXQ6IFVwZGF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdoYW5kbGVVcGRhdGUnPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKiogQ2FsbGVkIHdoZW4gdXBkYXRlIHZhbGlkYXRvciBjYWxsZWQgKi9cbiAgdmFsaWRhdGVVcGRhdGU/OiAoaW5wdXQ6IFVwZGF0ZUlucHV0LCBuZXh0OiBOZXh0PHRoaXMsICd2YWxpZGF0ZVVwZGF0ZSc+KSA9PiB2b2lkO1xuXG4gIC8qKiBDYWxsZWQgd2hlbiBzaWduYWwgaXMgZGVsaXZlcmVkIHRvIGEgV29ya2Zsb3cgZXhlY3V0aW9uICovXG4gIGhhbmRsZVNpZ25hbD86IChpbnB1dDogU2lnbmFsSW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2hhbmRsZVNpZ25hbCc+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBhIFdvcmtmbG93IGlzIHF1ZXJpZWRcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIHF1ZXJ5XG4gICAqL1xuICBoYW5kbGVRdWVyeT86IChpbnB1dDogUXVlcnlJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnaGFuZGxlUXVlcnknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zY2hlZHVsZUFjdGl2aXR5ICovXG5leHBvcnQgaW50ZXJmYWNlIEFjdGl2aXR5SW5wdXQge1xuICByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnM7XG4gIHJlYWRvbmx5IGhlYWRlcnM6IEhlYWRlcnM7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLnNjaGVkdWxlTG9jYWxBY3Rpdml0eSAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2NhbEFjdGl2aXR5SW5wdXQge1xuICByZWFkb25seSBhY3Rpdml0eVR5cGU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBvcHRpb25zOiBMb2NhbEFjdGl2aXR5T3B0aW9ucztcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG4gIHJlYWRvbmx5IG9yaWdpbmFsU2NoZWR1bGVUaW1lPzogVGltZXN0YW1wO1xuICByZWFkb25seSBhdHRlbXB0OiBudW1iZXI7XG59XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Iuc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIFN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbklucHV0IHtcbiAgcmVhZG9ubHkgd29ya2Zsb3dUeXBlOiBzdHJpbmc7XG4gIHJlYWRvbmx5IG9wdGlvbnM6IENoaWxkV29ya2Zsb3dPcHRpb25zV2l0aERlZmF1bHRzO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSBzZXE6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zdGFydFRpbWVyICovXG5leHBvcnQgaW50ZXJmYWNlIFRpbWVySW5wdXQge1xuICByZWFkb25seSBkdXJhdGlvbk1zOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNlcTogbnVtYmVyO1xufVxuXG4vKipcbiAqIFNhbWUgYXMgQ29udGludWVBc05ld09wdGlvbnMgYnV0IHdvcmtmbG93VHlwZSBtdXN0IGJlIGRlZmluZWRcbiAqL1xuZXhwb3J0IHR5cGUgQ29udGludWVBc05ld0lucHV0T3B0aW9ucyA9IENvbnRpbnVlQXNOZXdPcHRpb25zICYgUmVxdWlyZWQ8UGljazxDb250aW51ZUFzTmV3T3B0aW9ucywgJ3dvcmtmbG93VHlwZSc+PjtcblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5jb250aW51ZUFzTmV3ICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRpbnVlQXNOZXdJbnB1dCB7XG4gIHJlYWRvbmx5IGFyZ3M6IHVua25vd25bXTtcbiAgcmVhZG9ubHkgaGVhZGVyczogSGVhZGVycztcbiAgcmVhZG9ubHkgb3B0aW9uczogQ29udGludWVBc05ld0lucHV0T3B0aW9ucztcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd091dGJvdW5kQ2FsbHNJbnRlcmNlcHRvci5zaWduYWxXb3JrZmxvdyAqL1xuZXhwb3J0IGludGVyZmFjZSBTaWduYWxXb3JrZmxvd0lucHV0IHtcbiAgcmVhZG9ubHkgc2VxOiBudW1iZXI7XG4gIHJlYWRvbmx5IHNpZ25hbE5hbWU6IHN0cmluZztcbiAgcmVhZG9ubHkgYXJnczogdW5rbm93bltdO1xuICByZWFkb25seSBoZWFkZXJzOiBIZWFkZXJzO1xuICByZWFkb25seSB0YXJnZXQ6XG4gICAgfCB7XG4gICAgICAgIHJlYWRvbmx5IHR5cGU6ICdleHRlcm5hbCc7XG4gICAgICAgIHJlYWRvbmx5IHdvcmtmbG93RXhlY3V0aW9uOiBXb3JrZmxvd0V4ZWN1dGlvbjtcbiAgICAgIH1cbiAgICB8IHtcbiAgICAgICAgcmVhZG9ubHkgdHlwZTogJ2NoaWxkJztcbiAgICAgICAgcmVhZG9ubHkgY2hpbGRXb3JrZmxvd0lkOiBzdHJpbmc7XG4gICAgICB9O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yLmdldExvZ0F0dHJpYnV0ZXMgKi9cbmV4cG9ydCB0eXBlIEdldExvZ0F0dHJpYnV0ZXNJbnB1dCA9IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4vKipcbiAqIEltcGxlbWVudCBhbnkgb2YgdGhlc2UgbWV0aG9kcyB0byBpbnRlcmNlcHQgV29ya2Zsb3cgY29kZSBjYWxscyB0byB0aGUgVGVtcG9yYWwgQVBJcywgbGlrZSBzY2hlZHVsaW5nIGFuIGFjdGl2aXR5IGFuZCBzdGFydGluZyBhIHRpbWVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dPdXRib3VuZENhbGxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2NoZWR1bGVzIGFuIEFjdGl2aXR5XG4gICAqXG4gICAqIEByZXR1cm4gcmVzdWx0IG9mIHRoZSBhY3Rpdml0eSBleGVjdXRpb25cbiAgICovXG4gIHNjaGVkdWxlQWN0aXZpdHk/OiAoaW5wdXQ6IEFjdGl2aXR5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NjaGVkdWxlQWN0aXZpdHknPikgPT4gUHJvbWlzZTx1bmtub3duPjtcblxuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gV29ya2Zsb3cgc2NoZWR1bGVzIGEgbG9jYWwgQWN0aXZpdHlcbiAgICpcbiAgICogQHJldHVybiByZXN1bHQgb2YgdGhlIGFjdGl2aXR5IGV4ZWN1dGlvblxuICAgKi9cbiAgc2NoZWR1bGVMb2NhbEFjdGl2aXR5PzogKGlucHV0OiBMb2NhbEFjdGl2aXR5SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NjaGVkdWxlTG9jYWxBY3Rpdml0eSc+KSA9PiBQcm9taXNlPHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBzdGFydHMgYSB0aW1lclxuICAgKi9cbiAgc3RhcnRUaW1lcj86IChpbnB1dDogVGltZXJJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnc3RhcnRUaW1lcic+KSA9PiBQcm9taXNlPHZvaWQ+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgd2hlbiBXb3JrZmxvdyBjYWxscyBjb250aW51ZUFzTmV3XG4gICAqL1xuICBjb250aW51ZUFzTmV3PzogKGlucHV0OiBDb250aW51ZUFzTmV3SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ2NvbnRpbnVlQXNOZXcnPikgPT4gUHJvbWlzZTxuZXZlcj47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHNpZ25hbHMgYSBjaGlsZCBvciBleHRlcm5hbCBXb3JrZmxvd1xuICAgKi9cbiAgc2lnbmFsV29ya2Zsb3c/OiAoaW5wdXQ6IFNpZ25hbFdvcmtmbG93SW5wdXQsIG5leHQ6IE5leHQ8dGhpcywgJ3NpZ25hbFdvcmtmbG93Jz4pID0+IFByb21pc2U8dm9pZD47XG5cbiAgLyoqXG4gICAqIENhbGxlZCB3aGVuIFdvcmtmbG93IHN0YXJ0cyBhIGNoaWxkIHdvcmtmbG93IGV4ZWN1dGlvbiwgdGhlIGludGVyY2VwdG9yIGZ1bmN0aW9uIHJldHVybnMgMiBwcm9taXNlczpcbiAgICpcbiAgICogLSBUaGUgZmlyc3QgcmVzb2x2ZXMgd2l0aCB0aGUgYHJ1bklkYCB3aGVuIHRoZSBjaGlsZCB3b3JrZmxvdyBoYXMgc3RhcnRlZCBvciByZWplY3RzIGlmIGZhaWxlZCB0byBzdGFydC5cbiAgICogLSBUaGUgc2Vjb25kIHJlc29sdmVzIHdpdGggdGhlIHdvcmtmbG93IHJlc3VsdCB3aGVuIHRoZSBjaGlsZCB3b3JrZmxvdyBjb21wbGV0ZXMgb3IgcmVqZWN0cyBvbiBmYWlsdXJlLlxuICAgKi9cbiAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uPzogKFxuICAgIGlucHV0OiBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25JbnB1dCxcbiAgICBuZXh0OiBOZXh0PHRoaXMsICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nPlxuICApID0+IFByb21pc2U8W1Byb21pc2U8c3RyaW5nPiwgUHJvbWlzZTx1bmtub3duPl0+O1xuXG4gIC8qKlxuICAgKiBDYWxsZWQgb24gZWFjaCBpbnZvY2F0aW9uIG9mIHRoZSBgd29ya2Zsb3cubG9nYCBtZXRob2RzLlxuICAgKlxuICAgKiBUaGUgYXR0cmlidXRlcyByZXR1cm5lZCBpbiB0aGlzIGNhbGwgYXJlIGF0dGFjaGVkIHRvIGV2ZXJ5IGxvZyBtZXNzYWdlLlxuICAgKi9cbiAgZ2V0TG9nQXR0cmlidXRlcz86IChpbnB1dDogR2V0TG9nQXR0cmlidXRlc0lucHV0LCBuZXh0OiBOZXh0PHRoaXMsICdnZXRMb2dBdHRyaWJ1dGVzJz4pID0+IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xufVxuXG4vKiogSW5wdXQgZm9yIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3IuY29uY2x1ZGVBY3RpdmF0aW9uICovXG5leHBvcnQgaW50ZXJmYWNlIENvbmNsdWRlQWN0aXZhdGlvbklucHV0IHtcbiAgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdO1xufVxuXG4vKiogT3V0cHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmNvbmNsdWRlQWN0aXZhdGlvbiAqL1xuZXhwb3J0IHR5cGUgQ29uY2x1ZGVBY3RpdmF0aW9uT3V0cHV0ID0gQ29uY2x1ZGVBY3RpdmF0aW9uSW5wdXQ7XG5cbi8qKiBJbnB1dCBmb3IgV29ya2Zsb3dJbnRlcm5hbHNJbnRlcmNlcHRvci5hY3RpdmF0ZSAqL1xuZXhwb3J0IGludGVyZmFjZSBBY3RpdmF0ZUlucHV0IHtcbiAgYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb247XG4gIGJhdGNoSW5kZXg6IG51bWJlcjtcbn1cblxuLyoqIElucHV0IGZvciBXb3JrZmxvd0ludGVybmFsc0ludGVyY2VwdG9yLmRpc3Bvc2UgKi9cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlXG5leHBvcnQgaW50ZXJmYWNlIERpc3Bvc2VJbnB1dCB7fVxuXG4vKipcbiAqIEludGVyY2VwdG9yIGZvciB0aGUgaW50ZXJuYWxzIG9mIHRoZSBXb3JrZmxvdyBydW50aW1lLlxuICpcbiAqIFVzZSB0byBtYW5pcHVsYXRlIG9yIHRyYWNlIFdvcmtmbG93IGFjdGl2YXRpb25zLlxuICpcbiAqIEBleHBlcmltZW50YWwgVGhpcyBBUEkgaXMgZm9yIGFkdmFuY2VkIHVzZSBjYXNlcyBhbmQgbWF5IGNoYW5nZSBpbiB0aGUgZnV0dXJlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogQ2FsbGVkIHdoZW4gdGhlIFdvcmtmbG93IHJ1bnRpbWUgcnVucyBhIFdvcmtmbG93QWN0aXZhdGlvbkpvYi5cbiAgICovXG4gIGFjdGl2YXRlPyhpbnB1dDogQWN0aXZhdGVJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnYWN0aXZhdGUnPik6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBhZnRlciBhbGwgYFdvcmtmbG93QWN0aXZhdGlvbkpvYmBzIGhhdmUgYmVlbiBwcm9jZXNzZWQgZm9yIGFuIGFjdGl2YXRpb24uXG4gICAqXG4gICAqIENhbiBtYW5pcHVsYXRlIHRoZSBjb21tYW5kcyBnZW5lcmF0ZWQgYnkgdGhlIFdvcmtmbG93XG4gICAqL1xuICBjb25jbHVkZUFjdGl2YXRpb24/KGlucHV0OiBDb25jbHVkZUFjdGl2YXRpb25JbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJz4pOiBDb25jbHVkZUFjdGl2YXRpb25PdXRwdXQ7XG5cbiAgLyoqXG4gICAqIENhbGxlZCBiZWZvcmUgZGlzcG9zaW5nIHRoZSBXb3JrZmxvdyBpc29sYXRlIGNvbnRleHQuXG4gICAqXG4gICAqIEltcGxlbWVudCB0aGlzIG1ldGhvZCB0byBwZXJmb3JtIGFueSByZXNvdXJjZSBjbGVhbnVwLlxuICAgKi9cbiAgZGlzcG9zZT8oaW5wdXQ6IERpc3Bvc2VJbnB1dCwgbmV4dDogTmV4dDx0aGlzLCAnZGlzcG9zZSc+KTogdm9pZDtcbn1cblxuLyoqXG4gKiBBIG1hcHBpbmcgZnJvbSBpbnRlcmNlcHRvciB0eXBlIHRvIGFuIG9wdGlvbmFsIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dJbnRlcmNlcHRvcnMge1xuICBpbmJvdW5kPzogV29ya2Zsb3dJbmJvdW5kQ2FsbHNJbnRlcmNlcHRvcltdO1xuICBvdXRib3VuZD86IFdvcmtmbG93T3V0Ym91bmRDYWxsc0ludGVyY2VwdG9yW107XG4gIGludGVybmFscz86IFdvcmtmbG93SW50ZXJuYWxzSW50ZXJjZXB0b3JbXTtcbn1cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB7QGxpbmsgV29ya2Zsb3dJbnRlcmNlcHRvcnN9IGFuZCB0YWtlcyBubyBhcmd1bWVudHMuXG4gKlxuICogV29ya2Zsb3cgaW50ZXJjZXB0b3IgbW9kdWxlcyBzaG91bGQgZXhwb3J0IGFuIGBpbnRlcmNlcHRvcnNgIGZ1bmN0aW9uIG9mIHRoaXMgdHlwZS5cbiAqXG4gKiBAZXhhbXBsZVxuICpcbiAqIGBgYHRzXG4gKiBleHBvcnQgZnVuY3Rpb24gaW50ZXJjZXB0b3JzKCk6IFdvcmtmbG93SW50ZXJjZXB0b3JzIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBpbmJvdW5kOiBbXSwgICAvLyBQb3B1bGF0ZSB3aXRoIGxpc3Qgb2YgaW50ZXJjZXB0b3IgaW1wbGVtZW50YXRpb25zXG4gKiAgICAgb3V0Ym91bmQ6IFtdLCAgLy8gUG9wdWxhdGUgd2l0aCBsaXN0IG9mIGludGVyY2VwdG9yIGltcGxlbWVudGF0aW9uc1xuICogICAgIGludGVybmFsczogW10sIC8vIFBvcHVsYXRlIHdpdGggbGlzdCBvZiBpbnRlcmNlcHRvciBpbXBsZW1lbnRhdGlvbnNcbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSAoKSA9PiBXb3JrZmxvd0ludGVyY2VwdG9ycztcbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBSZXRyeVBvbGljeSxcbiAgVGVtcG9yYWxGYWlsdXJlLFxuICBDb21tb25Xb3JrZmxvd09wdGlvbnMsXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIFVwZGF0ZURlZmluaXRpb24sXG4gIFF1ZXJ5RGVmaW5pdGlvbixcbiAgRHVyYXRpb24sXG4gIFZlcnNpb25pbmdJbnRlbnQsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjaGVja0V4dGVuZHMsIFN5bWJvbEJhc2VkSW5zdGFuY2VPZkVycm9yIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuXG4vKipcbiAqIFdvcmtmbG93IEV4ZWN1dGlvbiBpbmZvcm1hdGlvblxuICovXG5leHBvcnQgaW50ZXJmYWNlIFdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBJRCBvZiB0aGUgV29ya2Zsb3csIHRoaXMgY2FuIGJlIHNldCBieSB0aGUgY2xpZW50IGR1cmluZyBXb3JrZmxvdyBjcmVhdGlvbi5cbiAgICogQSBzaW5nbGUgV29ya2Zsb3cgbWF5IHJ1biBtdWx0aXBsZSB0aW1lcyBlLmcuIHdoZW4gc2NoZWR1bGVkIHdpdGggY3Jvbi5cbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93SWQ6IHN0cmluZztcblxuICAvKipcbiAgICogSUQgb2YgYSBzaW5nbGUgV29ya2Zsb3cgcnVuXG4gICAqL1xuICByZWFkb25seSBydW5JZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBXb3JrZmxvdyBmdW5jdGlvbidzIG5hbWVcbiAgICovXG4gIHJlYWRvbmx5IHdvcmtmbG93VHlwZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBJbmRleGVkIGluZm9ybWF0aW9uIGF0dGFjaGVkIHRvIHRoZSBXb3JrZmxvdyBFeGVjdXRpb25cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBtYXkgY2hhbmdlIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKi9cbiAgcmVhZG9ubHkgc2VhcmNoQXR0cmlidXRlczogU2VhcmNoQXR0cmlidXRlcztcblxuICAvKipcbiAgICogTm9uLWluZGV4ZWQgaW5mb3JtYXRpb24gYXR0YWNoZWQgdG8gdGhlIFdvcmtmbG93IEV4ZWN1dGlvblxuICAgKi9cbiAgcmVhZG9ubHkgbWVtbz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuXG4gIC8qKlxuICAgKiBQYXJlbnQgV29ya2Zsb3cgaW5mbyAocHJlc2VudCBpZiB0aGlzIGlzIGEgQ2hpbGQgV29ya2Zsb3cpXG4gICAqL1xuICByZWFkb25seSBwYXJlbnQ/OiBQYXJlbnRXb3JrZmxvd0luZm87XG5cbiAgLyoqXG4gICAqIFJlc3VsdCBmcm9tIHRoZSBwcmV2aW91cyBSdW4gKHByZXNlbnQgaWYgdGhpcyBpcyBhIENyb24gV29ya2Zsb3cgb3Igd2FzIENvbnRpbnVlZCBBcyBOZXcpLlxuICAgKlxuICAgKiBBbiBhcnJheSBvZiB2YWx1ZXMsIHNpbmNlIG90aGVyIFNES3MgbWF5IHJldHVybiBtdWx0aXBsZSB2YWx1ZXMgZnJvbSBhIFdvcmtmbG93LlxuICAgKi9cbiAgcmVhZG9ubHkgbGFzdFJlc3VsdD86IHVua25vd247XG5cbiAgLyoqXG4gICAqIEZhaWx1cmUgZnJvbSB0aGUgcHJldmlvdXMgUnVuIChwcmVzZW50IHdoZW4gdGhpcyBSdW4gaXMgYSByZXRyeSwgb3IgdGhlIGxhc3QgUnVuIG9mIGEgQ3JvbiBXb3JrZmxvdyBmYWlsZWQpXG4gICAqL1xuICByZWFkb25seSBsYXN0RmFpbHVyZT86IFRlbXBvcmFsRmFpbHVyZTtcblxuICAvKipcbiAgICogTGVuZ3RoIG9mIFdvcmtmbG93IGhpc3RvcnkgdXAgdW50aWwgdGhlIGN1cnJlbnQgV29ya2Zsb3cgVGFzay5cbiAgICpcbiAgICogVGhpcyB2YWx1ZSBjaGFuZ2VzIGR1cmluZyB0aGUgbGlmZXRpbWUgb2YgYW4gRXhlY3V0aW9uLlxuICAgKlxuICAgKiBZb3UgbWF5IHNhZmVseSB1c2UgdGhpcyBpbmZvcm1hdGlvbiB0byBkZWNpZGUgd2hlbiB0byB7QGxpbmsgY29udGludWVBc05ld30uXG4gICAqL1xuICByZWFkb25seSBoaXN0b3J5TGVuZ3RoOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFNpemUgb2YgV29ya2Zsb3cgaGlzdG9yeSBpbiBieXRlcyB1bnRpbCB0aGUgY3VycmVudCBXb3JrZmxvdyBUYXNrLlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFN1cHBvcnRlZCBvbmx5IG9uIFRlbXBvcmFsIFNlcnZlciAxLjIwKywgYWx3YXlzIHplcm8gb24gb2xkZXIgc2VydmVycy5cbiAgICpcbiAgICogWW91IG1heSBzYWZlbHkgdXNlIHRoaXMgaW5mb3JtYXRpb24gdG8gZGVjaWRlIHdoZW4gdG8ge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKi9cbiAgcmVhZG9ubHkgaGlzdG9yeVNpemU6IG51bWJlcjtcblxuICAvKipcbiAgICogQSBoaW50IHByb3ZpZGVkIGJ5IHRoZSBjdXJyZW50IFdvcmtmbG93VGFza1N0YXJ0ZWQgZXZlbnQgcmVjb21tZW5kaW5nIHdoZXRoZXIgdG9cbiAgICoge0BsaW5rIGNvbnRpbnVlQXNOZXd9LlxuICAgKlxuICAgKiBUaGlzIHZhbHVlIGNoYW5nZXMgZHVyaW5nIHRoZSBsaWZldGltZSBvZiBhbiBFeGVjdXRpb24uXG4gICAqXG4gICAqIFN1cHBvcnRlZCBvbmx5IG9uIFRlbXBvcmFsIFNlcnZlciAxLjIwKywgYWx3YXlzIGBmYWxzZWAgb24gb2xkZXIgc2VydmVycy5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRpbnVlQXNOZXdTdWdnZXN0ZWQ6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFRhc2sgcXVldWUgdGhpcyBXb3JrZmxvdyBpcyBleGVjdXRpbmcgb25cbiAgICovXG4gIHJlYWRvbmx5IHRhc2tRdWV1ZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBOYW1lc3BhY2UgdGhpcyBXb3JrZmxvdyBpcyBleGVjdXRpbmcgaW5cbiAgICovXG4gIHJlYWRvbmx5IG5hbWVzcGFjZTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBSdW4gSWQgb2YgdGhlIGZpcnN0IFJ1biBpbiB0aGlzIEV4ZWN1dGlvbiBDaGFpblxuICAgKi9cbiAgcmVhZG9ubHkgZmlyc3RFeGVjdXRpb25SdW5JZDogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbGFzdCBSdW4gSWQgaW4gdGhpcyBFeGVjdXRpb24gQ2hhaW5cbiAgICovXG4gIHJlYWRvbmx5IGNvbnRpbnVlZEZyb21FeGVjdXRpb25SdW5JZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGltZSBhdCB3aGljaCB0aGlzIFtXb3JrZmxvdyBFeGVjdXRpb24gQ2hhaW5dKGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby93b3JrZmxvd3Mjd29ya2Zsb3ctZXhlY3V0aW9uLWNoYWluKSB3YXMgc3RhcnRlZFxuICAgKi9cbiAgcmVhZG9ubHkgc3RhcnRUaW1lOiBEYXRlO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBjdXJyZW50IFdvcmtmbG93IFJ1biBzdGFydGVkXG4gICAqL1xuICByZWFkb25seSBydW5TdGFydFRpbWU6IERhdGU7XG5cbiAgLyoqXG4gICAqIE1pbGxpc2Vjb25kcyBhZnRlciB3aGljaCB0aGUgV29ya2Zsb3cgRXhlY3V0aW9uIGlzIGF1dG9tYXRpY2FsbHkgdGVybWluYXRlZCBieSBUZW1wb3JhbCBTZXJ2ZXIuIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy53b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXR9LlxuICAgKi9cbiAgcmVhZG9ubHkgZXhlY3V0aW9uVGltZW91dE1zPzogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBUaW1lIGF0IHdoaWNoIHRoZSBXb3JrZmxvdyBFeGVjdXRpb24gZXhwaXJlc1xuICAgKi9cbiAgcmVhZG9ubHkgZXhlY3V0aW9uRXhwaXJhdGlvblRpbWU/OiBEYXRlO1xuXG4gIC8qKlxuICAgKiBNaWxsaXNlY29uZHMgYWZ0ZXIgd2hpY2ggdGhlIFdvcmtmbG93IFJ1biBpcyBhdXRvbWF0aWNhbGx5IHRlcm1pbmF0ZWQgYnkgVGVtcG9yYWwgU2VydmVyLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0fS5cbiAgICovXG4gIHJlYWRvbmx5IHJ1blRpbWVvdXRNcz86IG51bWJlcjtcblxuICAvKipcbiAgICogTWF4aW11bSBleGVjdXRpb24gdGltZSBvZiBhIFdvcmtmbG93IFRhc2sgaW4gbWlsbGlzZWNvbmRzLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dH0uXG4gICAqL1xuICByZWFkb25seSB0YXNrVGltZW91dE1zOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJldHJ5IFBvbGljeSBmb3IgdGhpcyBFeGVjdXRpb24uIFNldCB2aWEge0BsaW5rIFdvcmtmbG93T3B0aW9ucy5yZXRyeX0uXG4gICAqL1xuICByZWFkb25seSByZXRyeVBvbGljeT86IFJldHJ5UG9saWN5O1xuXG4gIC8qKlxuICAgKiBTdGFydHMgYXQgMSBhbmQgaW5jcmVtZW50cyBmb3IgZXZlcnkgcmV0cnkgaWYgdGhlcmUgaXMgYSBgcmV0cnlQb2xpY3lgXG4gICAqL1xuICByZWFkb25seSBhdHRlbXB0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIENyb24gU2NoZWR1bGUgZm9yIHRoaXMgRXhlY3V0aW9uLiBTZXQgdmlhIHtAbGluayBXb3JrZmxvd09wdGlvbnMuY3JvblNjaGVkdWxlfS5cbiAgICovXG4gIHJlYWRvbmx5IGNyb25TY2hlZHVsZT86IHN0cmluZztcblxuICAvKipcbiAgICogTWlsbGlzZWNvbmRzIGJldHdlZW4gQ3JvbiBSdW5zXG4gICAqL1xuICByZWFkb25seSBjcm9uU2NoZWR1bGVUb1NjaGVkdWxlSW50ZXJ2YWw/OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFRoZSBCdWlsZCBJRCBvZiB0aGUgd29ya2VyIHdoaWNoIGV4ZWN1dGVkIHRoZSBjdXJyZW50IFdvcmtmbG93IFRhc2suIE1heSBiZSB1bmRlZmluZWQgaWYgdGhlXG4gICAqIHRhc2sgd2FzIGNvbXBsZXRlZCBieSBhIHdvcmtlciB3aXRob3V0IGEgQnVpbGQgSUQuIElmIHRoaXMgd29ya2VyIGlzIHRoZSBvbmUgZXhlY3V0aW5nIHRoaXNcbiAgICogdGFzayBmb3IgdGhlIGZpcnN0IHRpbWUgYW5kIGhhcyBhIEJ1aWxkIElEIHNldCwgdGhlbiBpdHMgSUQgd2lsbCBiZSB1c2VkLiBUaGlzIHZhbHVlIG1heSBjaGFuZ2VcbiAgICogb3ZlciB0aGUgbGlmZXRpbWUgb2YgdGhlIHdvcmtmbG93IHJ1biwgYnV0IGlzIGRldGVybWluaXN0aWMgYW5kIHNhZmUgdG8gdXNlIGZvciBicmFuY2hpbmcuXG4gICAqL1xuICByZWFkb25seSBjdXJyZW50QnVpbGRJZD86IHN0cmluZztcblxuICByZWFkb25seSB1bnNhZmU6IFVuc2FmZVdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBVbnNhZmUgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cgRXhlY3V0aW9uLlxuICpcbiAqIE5ldmVyIHJlbHkgb24gdGhpcyBpbmZvcm1hdGlvbiBpbiBXb3JrZmxvdyBsb2dpYyBhcyBpdCB3aWxsIGNhdXNlIG5vbi1kZXRlcm1pbmlzdGljIGJlaGF2aW9yLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFVuc2FmZVdvcmtmbG93SW5mbyB7XG4gIC8qKlxuICAgKiBDdXJyZW50IHN5c3RlbSB0aW1lIGluIG1pbGxpc2Vjb25kc1xuICAgKlxuICAgKiBUaGUgc2FmZSB2ZXJzaW9uIG9mIHRpbWUgaXMgYG5ldyBEYXRlKClgIGFuZCBgRGF0ZS5ub3coKWAsIHdoaWNoIGFyZSBzZXQgb24gdGhlIGZpcnN0IGludm9jYXRpb24gb2YgYSBXb3JrZmxvd1xuICAgKiBUYXNrIGFuZCBzdGF5IGNvbnN0YW50IGZvciB0aGUgZHVyYXRpb24gb2YgdGhlIFRhc2sgYW5kIGR1cmluZyByZXBsYXkuXG4gICAqL1xuICByZWFkb25seSBub3c6ICgpID0+IG51bWJlcjtcblxuICByZWFkb25seSBpc1JlcGxheWluZzogYm9vbGVhbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQYXJlbnRXb3JrZmxvd0luZm8ge1xuICB3b3JrZmxvd0lkOiBzdHJpbmc7XG4gIHJ1bklkOiBzdHJpbmc7XG4gIG5hbWVzcGFjZTogc3RyaW5nO1xufVxuXG4vKipcbiAqIE5vdCBhbiBhY3R1YWwgZXJyb3IsIHVzZWQgYnkgdGhlIFdvcmtmbG93IHJ1bnRpbWUgdG8gYWJvcnQgZXhlY3V0aW9uIHdoZW4ge0BsaW5rIGNvbnRpbnVlQXNOZXd9IGlzIGNhbGxlZFxuICovXG5AU3ltYm9sQmFzZWRJbnN0YW5jZU9mRXJyb3IoJ0NvbnRpbnVlQXNOZXcnKVxuZXhwb3J0IGNsYXNzIENvbnRpbnVlQXNOZXcgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyByZWFkb25seSBjb21tYW5kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklDb250aW51ZUFzTmV3V29ya2Zsb3dFeGVjdXRpb24pIHtcbiAgICBzdXBlcignV29ya2Zsb3cgY29udGludWVkIGFzIG5ldycpO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgY29udGludWluZyBhIFdvcmtmbG93IGFzIG5ld1xuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbnRpbnVlQXNOZXdPcHRpb25zIHtcbiAgLyoqXG4gICAqIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgV29ya2Zsb3cgdHlwZSBuYW1lLCBlLmcuIHRoZSBmaWxlbmFtZSBpbiB0aGUgTm9kZS5qcyBTREsgb3IgY2xhc3MgbmFtZSBpbiBKYXZhXG4gICAqL1xuICB3b3JrZmxvd1R5cGU/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBUYXNrIHF1ZXVlIHRvIGNvbnRpbnVlIHRoZSBXb3JrZmxvdyBpblxuICAgKi9cbiAgdGFza1F1ZXVlPzogc3RyaW5nO1xuICAvKipcbiAgICogVGltZW91dCBmb3IgdGhlIGVudGlyZSBXb3JrZmxvdyBydW5cbiAgICogQGZvcm1hdCB7QGxpbmsgaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2UvbXMgfCBtcy1mb3JtYXR0ZWQgc3RyaW5nfVxuICAgKi9cbiAgd29ya2Zsb3dSdW5UaW1lb3V0PzogRHVyYXRpb247XG4gIC8qKlxuICAgKiBUaW1lb3V0IGZvciBhIHNpbmdsZSBXb3JrZmxvdyB0YXNrXG4gICAqIEBmb3JtYXQge0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAgICovXG4gIHdvcmtmbG93VGFza1RpbWVvdXQ/OiBEdXJhdGlvbjtcbiAgLyoqXG4gICAqIE5vbi1zZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBtZW1vPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIC8qKlxuICAgKiBTZWFyY2hhYmxlIGF0dHJpYnV0ZXMgdG8gYXR0YWNoIHRvIG5leHQgV29ya2Zsb3cgcnVuXG4gICAqL1xuICBzZWFyY2hBdHRyaWJ1dGVzPzogU2VhcmNoQXR0cmlidXRlcztcbiAgLyoqXG4gICAqIFdoZW4gdXNpbmcgdGhlIFdvcmtlciBWZXJzaW9uaW5nIGZlYXR1cmUsIHNwZWNpZmllcyB3aGV0aGVyIHRoaXMgV29ya2Zsb3cgc2hvdWxkXG4gICAqIENvbnRpbnVlLWFzLU5ldyBvbnRvIGEgd29ya2VyIHdpdGggYSBjb21wYXRpYmxlIEJ1aWxkIElkIG9yIG5vdC4gU2VlIHtAbGluayBWZXJzaW9uaW5nSW50ZW50fS5cbiAgICpcbiAgICogQGRlZmF1bHQgJ0NPTVBBVElCTEUnXG4gICAqXG4gICAqIEBleHBlcmltZW50YWxcbiAgICovXG4gIHZlcnNpb25pbmdJbnRlbnQ/OiBWZXJzaW9uaW5nSW50ZW50O1xufVxuXG4vKipcbiAqIFNwZWNpZmllczpcbiAqIC0gd2hldGhlciBjYW5jZWxsYXRpb24gcmVxdWVzdHMgYXJlIHNlbnQgdG8gdGhlIENoaWxkXG4gKiAtIHdoZXRoZXIgYW5kIHdoZW4gYSB7QGxpbmsgQ2FuY2VsZWRGYWlsdXJlfSBpcyB0aHJvd24gZnJvbSB7QGxpbmsgZXhlY3V0ZUNoaWxkfSBvclxuICogICB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZS5yZXN1bHR9XG4gKlxuICogQGRlZmF1bHQge0BsaW5rIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLldBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRH1cbiAqL1xuZXhwb3J0IGVudW0gQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUge1xuICAvKipcbiAgICogRG9uJ3Qgc2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC5cbiAgICovXG4gIEFCQU5ET04gPSAwLFxuXG4gIC8qKlxuICAgKiBTZW5kIGEgY2FuY2VsbGF0aW9uIHJlcXVlc3QgdG8gdGhlIENoaWxkLiBJbW1lZGlhdGVseSB0aHJvdyB0aGUgZXJyb3IuXG4gICAqL1xuICBUUllfQ0FOQ0VMID0gMSxcblxuICAvKipcbiAgICogU2VuZCBhIGNhbmNlbGxhdGlvbiByZXF1ZXN0IHRvIHRoZSBDaGlsZC4gVGhlIENoaWxkIG1heSByZXNwZWN0IGNhbmNlbGxhdGlvbiwgaW4gd2hpY2ggY2FzZSBhbiBlcnJvciB3aWxsIGJlIHRocm93blxuICAgKiB3aGVuIGNhbmNlbGxhdGlvbiBoYXMgY29tcGxldGVkLCBhbmQge0BsaW5rIGlzQ2FuY2VsbGF0aW9ufShlcnJvcikgd2lsbCBiZSB0cnVlLiBPbiB0aGUgb3RoZXIgaGFuZCwgdGhlIENoaWxkIG1heVxuICAgKiBpZ25vcmUgdGhlIGNhbmNlbGxhdGlvbiByZXF1ZXN0LCBpbiB3aGljaCBjYXNlIGFuIGVycm9yIG1pZ2h0IGJlIHRocm93biB3aXRoIGEgZGlmZmVyZW50IGNhdXNlLCBvciB0aGUgQ2hpbGQgbWF5XG4gICAqIGNvbXBsZXRlIHN1Y2Nlc3NmdWxseS5cbiAgICpcbiAgICogQGRlZmF1bHRcbiAgICovXG4gIFdBSVRfQ0FOQ0VMTEFUSU9OX0NPTVBMRVRFRCA9IDIsXG5cbiAgLyoqXG4gICAqIFNlbmQgYSBjYW5jZWxsYXRpb24gcmVxdWVzdCB0byB0aGUgQ2hpbGQuIFRocm93IHRoZSBlcnJvciBvbmNlIHRoZSBTZXJ2ZXIgcmVjZWl2ZXMgdGhlIENoaWxkIGNhbmNlbGxhdGlvbiByZXF1ZXN0LlxuICAgKi9cbiAgV0FJVF9DQU5DRUxMQVRJT05fUkVRVUVTVEVEID0gMyxcbn1cblxuY2hlY2tFeHRlbmRzPGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUsIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlPigpO1xuY2hlY2tFeHRlbmRzPENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLCBjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LkNoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlPigpO1xuXG4vKipcbiAqIEhvdyBhIENoaWxkIFdvcmtmbG93IHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICpcbiAqIEBzZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWEtcGFyZW50LWNsb3NlLXBvbGljeS8gfCBQYXJlbnQgQ2xvc2UgUG9saWN5fVxuICovXG5leHBvcnQgZW51bSBQYXJlbnRDbG9zZVBvbGljeSB7XG4gIC8qKlxuICAgKiBJZiBhIGBQYXJlbnRDbG9zZVBvbGljeWAgaXMgc2V0IHRvIHRoaXMsIG9yIGlzIG5vdCBzZXQgYXQgYWxsLCB0aGUgc2VydmVyIGRlZmF1bHQgdmFsdWUgd2lsbCBiZSB1c2VkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9VTlNQRUNJRklFRCA9IDAsXG5cbiAgLyoqXG4gICAqIFdoZW4gdGhlIFBhcmVudCBpcyBDbG9zZWQsIHRoZSBDaGlsZCBpcyBUZXJtaW5hdGVkLlxuICAgKlxuICAgKiBAZGVmYXVsdFxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEUgPSAxLFxuXG4gIC8qKlxuICAgKiBXaGVuIHRoZSBQYXJlbnQgaXMgQ2xvc2VkLCBub3RoaW5nIGlzIGRvbmUgdG8gdGhlIENoaWxkLlxuICAgKi9cbiAgUEFSRU5UX0NMT1NFX1BPTElDWV9BQkFORE9OID0gMixcblxuICAvKipcbiAgICogV2hlbiB0aGUgUGFyZW50IGlzIENsb3NlZCwgdGhlIENoaWxkIGlzIENhbmNlbGxlZC5cbiAgICovXG4gIFBBUkVOVF9DTE9TRV9QT0xJQ1lfUkVRVUVTVF9DQU5DRUwgPSAzLFxufVxuXG5jaGVja0V4dGVuZHM8Y29yZXNkay5jaGlsZF93b3JrZmxvdy5QYXJlbnRDbG9zZVBvbGljeSwgUGFyZW50Q2xvc2VQb2xpY3k+KCk7XG5jaGVja0V4dGVuZHM8UGFyZW50Q2xvc2VQb2xpY3ksIGNvcmVzZGsuY2hpbGRfd29ya2Zsb3cuUGFyZW50Q2xvc2VQb2xpY3k+KCk7XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ2hpbGRXb3JrZmxvd09wdGlvbnMgZXh0ZW5kcyBDb21tb25Xb3JrZmxvd09wdGlvbnMge1xuICAvKipcbiAgICogV29ya2Zsb3cgaWQgdG8gdXNlIHdoZW4gc3RhcnRpbmcuIElmIG5vdCBzcGVjaWZpZWQgYSBVVUlEIGlzIGdlbmVyYXRlZC4gTm90ZSB0aGF0IGl0IGlzXG4gICAqIGRhbmdlcm91cyBhcyBpbiBjYXNlIG9mIGNsaWVudCBzaWRlIHJldHJpZXMgbm8gZGVkdXBsaWNhdGlvbiB3aWxsIGhhcHBlbiBiYXNlZCBvbiB0aGVcbiAgICogZ2VuZXJhdGVkIGlkLiBTbyBwcmVmZXIgYXNzaWduaW5nIGJ1c2luZXNzIG1lYW5pbmdmdWwgaWRzIGlmIHBvc3NpYmxlLlxuICAgKi9cbiAgd29ya2Zsb3dJZD86IHN0cmluZztcblxuICAvKipcbiAgICogVGFzayBxdWV1ZSB0byB1c2UgZm9yIFdvcmtmbG93IHRhc2tzLiBJdCBzaG91bGQgbWF0Y2ggYSB0YXNrIHF1ZXVlIHNwZWNpZmllZCB3aGVuIGNyZWF0aW5nIGFcbiAgICogYFdvcmtlcmAgdGhhdCBob3N0cyB0aGUgV29ya2Zsb3cgY29kZS5cbiAgICovXG4gIHRhc2tRdWV1ZT86IHN0cmluZztcblxuICAvKipcbiAgICogU3BlY2lmaWVzOlxuICAgKiAtIHdoZXRoZXIgY2FuY2VsbGF0aW9uIHJlcXVlc3RzIGFyZSBzZW50IHRvIHRoZSBDaGlsZFxuICAgKiAtIHdoZXRoZXIgYW5kIHdoZW4gYW4gZXJyb3IgaXMgdGhyb3duIGZyb20ge0BsaW5rIGV4ZWN1dGVDaGlsZH0gb3JcbiAgICogICB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZS5yZXN1bHR9XG4gICAqXG4gICAqIEBkZWZhdWx0IHtAbGluayBDaGlsZFdvcmtmbG93Q2FuY2VsbGF0aW9uVHlwZS5XQUlUX0NBTkNFTExBVElPTl9DT01QTEVURUR9XG4gICAqL1xuICBjYW5jZWxsYXRpb25UeXBlPzogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGU7XG5cbiAgLyoqXG4gICAqIFNwZWNpZmllcyBob3cgdGhlIENoaWxkIHJlYWN0cyB0byB0aGUgUGFyZW50IFdvcmtmbG93IHJlYWNoaW5nIGEgQ2xvc2VkIHN0YXRlLlxuICAgKlxuICAgKiBAZGVmYXVsdCB7QGxpbmsgUGFyZW50Q2xvc2VQb2xpY3kuUEFSRU5UX0NMT1NFX1BPTElDWV9URVJNSU5BVEV9XG4gICAqL1xuICBwYXJlbnRDbG9zZVBvbGljeT86IFBhcmVudENsb3NlUG9saWN5O1xuXG4gIC8qKlxuICAgKiBXaGVuIHVzaW5nIHRoZSBXb3JrZXIgVmVyc2lvbmluZyBmZWF0dXJlLCBzcGVjaWZpZXMgd2hldGhlciB0aGlzIENoaWxkIFdvcmtmbG93IHNob3VsZCBydW4gb25cbiAgICogYSB3b3JrZXIgd2l0aCBhIGNvbXBhdGlibGUgQnVpbGQgSWQgb3Igbm90LiBTZWUge0BsaW5rIFZlcnNpb25pbmdJbnRlbnR9LlxuICAgKlxuICAgKiBAZGVmYXVsdCAnQ09NUEFUSUJMRSdcbiAgICpcbiAgICogQGV4cGVyaW1lbnRhbFxuICAgKi9cbiAgdmVyc2lvbmluZ0ludGVudD86IFZlcnNpb25pbmdJbnRlbnQ7XG59XG5cbmV4cG9ydCB0eXBlIFJlcXVpcmVkQ2hpbGRXb3JrZmxvd09wdGlvbnMgPSBSZXF1aXJlZDxQaWNrPENoaWxkV29ya2Zsb3dPcHRpb25zLCAnd29ya2Zsb3dJZCcgfCAnY2FuY2VsbGF0aW9uVHlwZSc+PiAmIHtcbiAgYXJnczogdW5rbm93bltdO1xufTtcblxuZXhwb3J0IHR5cGUgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMgPSBDaGlsZFdvcmtmbG93T3B0aW9ucyAmIFJlcXVpcmVkQ2hpbGRXb3JrZmxvd09wdGlvbnM7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU0RLSW5mbyB7XG4gIG5hbWU6IHN0cmluZztcbiAgdmVyc2lvbjogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBzbGljZSBvZiBhIGZpbGUgc3RhcnRpbmcgYXQgbGluZU9mZnNldFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVTbGljZSB7XG4gIC8qKlxuICAgKiBzbGljZSBvZiBhIGZpbGUgd2l0aCBgXFxuYCAobmV3bGluZSkgbGluZSB0ZXJtaW5hdG9yLlxuICAgKi9cbiAgY29udGVudDogc3RyaW5nO1xuICAvKipcbiAgICogT25seSB1c2VkIHBvc3NpYmxlIHRvIHRyaW0gdGhlIGZpbGUgd2l0aG91dCBicmVha2luZyBzeW50YXggaGlnaGxpZ2h0aW5nLlxuICAgKi9cbiAgbGluZU9mZnNldDogbnVtYmVyO1xufVxuXG4vKipcbiAqIEEgcG9pbnRlciB0byBhIGxvY2F0aW9uIGluIGEgZmlsZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEZpbGVMb2NhdGlvbiB7XG4gIC8qKlxuICAgKiBQYXRoIHRvIHNvdXJjZSBmaWxlIChhYnNvbHV0ZSBvciByZWxhdGl2ZSkuXG4gICAqIFdoZW4gdXNpbmcgYSByZWxhdGl2ZSBwYXRoLCBtYWtlIHN1cmUgYWxsIHBhdGhzIGFyZSByZWxhdGl2ZSB0byB0aGUgc2FtZSByb290LlxuICAgKi9cbiAgZmlsZVBhdGg/OiBzdHJpbmc7XG4gIC8qKlxuICAgKiBJZiBwb3NzaWJsZSwgU0RLIHNob3VsZCBzZW5kIHRoaXMsIHJlcXVpcmVkIGZvciBkaXNwbGF5aW5nIHRoZSBjb2RlIGxvY2F0aW9uLlxuICAgKi9cbiAgbGluZT86IG51bWJlcjtcbiAgLyoqXG4gICAqIElmIHBvc3NpYmxlLCBTREsgc2hvdWxkIHNlbmQgdGhpcy5cbiAgICovXG4gIGNvbHVtbj86IG51bWJlcjtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIG5hbWUgdGhpcyBsaW5lIGJlbG9uZ3MgdG8gKGlmIGFwcGxpY2FibGUpLlxuICAgKiBVc2VkIGZvciBmYWxsaW5nIGJhY2sgdG8gc3RhY2sgdHJhY2Ugdmlldy5cbiAgICovXG4gIGZ1bmN0aW9uTmFtZT86IHN0cmluZztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTdGFja1RyYWNlIHtcbiAgbG9jYXRpb25zOiBGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBVc2VkIGFzIHRoZSByZXN1bHQgZm9yIHRoZSBlbmhhbmNlZCBzdGFjayB0cmFjZSBxdWVyeVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEVuaGFuY2VkU3RhY2tUcmFjZSB7XG4gIHNkazogU0RLSW5mbztcbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgZmlsZSBwYXRoIHRvIGZpbGUgY29udGVudHMuXG4gICAqIFNESyBtYXkgY2hvb3NlIHRvIHNlbmQgbm8sIHNvbWUgb3IgYWxsIHNvdXJjZXMuXG4gICAqIFNvdXJjZXMgbWlnaHQgYmUgdHJpbW1lZCwgYW5kIHNvbWUgdGltZSBvbmx5IHRoZSBmaWxlKHMpIG9mIHRoZSB0b3AgZWxlbWVudCBvZiB0aGUgdHJhY2Ugd2lsbCBiZSBzZW50LlxuICAgKi9cbiAgc291cmNlczogUmVjb3JkPHN0cmluZywgRmlsZVNsaWNlW10+O1xuICBzdGFja3M6IFN0YWNrVHJhY2VbXTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBXb3JrZmxvd0NyZWF0ZU9wdGlvbnMge1xuICBpbmZvOiBXb3JrZmxvd0luZm87XG4gIHJhbmRvbW5lc3NTZWVkOiBudW1iZXJbXTtcbiAgbm93OiBudW1iZXI7XG4gIHBhdGNoZXM6IHN0cmluZ1tdO1xuICBzaG93U3RhY2tUcmFjZVNvdXJjZXM6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwgZXh0ZW5kcyBXb3JrZmxvd0NyZWF0ZU9wdGlvbnMge1xuICBzb3VyY2VNYXA6IFJhd1NvdXJjZU1hcDtcbiAgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXM6IFNldDxzdHJpbmc+O1xuICBnZXRUaW1lT2ZEYXkoKTogYmlnaW50O1xufVxuXG4vKipcbiAqIEEgaGFuZGxlciBmdW5jdGlvbiBjYXBhYmxlIG9mIGFjY2VwdGluZyB0aGUgYXJndW1lbnRzIGZvciBhIGdpdmVuIFVwZGF0ZURlZmluaXRpb24sIFNpZ25hbERlZmluaXRpb24gb3IgUXVlcnlEZWZpbml0aW9uLlxuICovXG5leHBvcnQgdHlwZSBIYW5kbGVyPFxuICBSZXQsXG4gIEFyZ3MgZXh0ZW5kcyBhbnlbXSxcbiAgVCBleHRlbmRzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzPiB8IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzPixcbj4gPSBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxpbmZlciBSLCBpbmZlciBBPlxuICA/ICguLi5hcmdzOiBBKSA9PiBSIHwgUHJvbWlzZTxSPlxuICA6IFQgZXh0ZW5kcyBTaWduYWxEZWZpbml0aW9uPGluZmVyIEE+XG4gICAgPyAoLi4uYXJnczogQSkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD5cbiAgICA6IFQgZXh0ZW5kcyBRdWVyeURlZmluaXRpb248aW5mZXIgUiwgaW5mZXIgQT5cbiAgICAgID8gKC4uLmFyZ3M6IEEpID0+IFJcbiAgICAgIDogbmV2ZXI7XG5cbi8qKlxuICogQSBoYW5kbGVyIGZ1bmN0aW9uIGFjY2VwdGluZyBzaWduYWwgY2FsbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcy5cbiAqL1xuZXhwb3J0IHR5cGUgRGVmYXVsdFNpZ25hbEhhbmRsZXIgPSAoc2lnbmFsTmFtZTogc3RyaW5nLCAuLi5hcmdzOiB1bmtub3duW10pID0+IHZvaWQgfCBQcm9taXNlPHZvaWQ+O1xuXG4vKipcbiAqIEEgdmFsaWRhdGlvbiBmdW5jdGlvbiBjYXBhYmxlIG9mIGFjY2VwdGluZyB0aGUgYXJndW1lbnRzIGZvciBhIGdpdmVuIFVwZGF0ZURlZmluaXRpb24uXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZVZhbGlkYXRvcjxBcmdzIGV4dGVuZHMgYW55W10+ID0gKC4uLmFyZ3M6IEFyZ3MpID0+IHZvaWQ7XG5cbi8qKlxuICogQSBkZXNjcmlwdGlvbiBvZiBhIHF1ZXJ5IGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFF1ZXJ5SGFuZGxlck9wdGlvbnMgPSB7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH07XG5cbi8qKlxuICogQSBkZXNjcmlwdGlvbiBvZiBhIHNpZ25hbCBoYW5kbGVyLlxuICovXG5leHBvcnQgdHlwZSBTaWduYWxIYW5kbGVyT3B0aW9ucyA9IHsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcblxuLyoqXG4gKiBBIHZhbGlkYXRvciBhbmQgZGVzY3JpcHRpb24gb2YgYW4gdXBkYXRlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCB0eXBlIFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3MgZXh0ZW5kcyBhbnlbXT4gPSB7IHZhbGlkYXRvcj86IFVwZGF0ZVZhbGlkYXRvcjxBcmdzPjsgZGVzY3JpcHRpb24/OiBzdHJpbmcgfTtcbiIsImltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcCc7XG5pbXBvcnQge1xuICBkZWZhdWx0RmFpbHVyZUNvbnZlcnRlcixcbiAgRmFpbHVyZUNvbnZlcnRlcixcbiAgUGF5bG9hZENvbnZlcnRlcixcbiAgYXJyYXlGcm9tUGF5bG9hZHMsXG4gIGRlZmF1bHRQYXlsb2FkQ29udmVydGVyLFxuICBlbnN1cmVUZW1wb3JhbEZhaWx1cmUsXG4gIElsbGVnYWxTdGF0ZUVycm9yLFxuICBUZW1wb3JhbEZhaWx1cmUsXG4gIFdvcmtmbG93LFxuICBXb3JrZmxvd0V4ZWN1dGlvbkFscmVhZHlTdGFydGVkRXJyb3IsXG4gIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlLFxuICBXb3JrZmxvd1NpZ25hbEFubm90YXRlZFR5cGUsXG4gIFdvcmtmbG93VXBkYXRlQW5ub3RhdGVkVHlwZSxcbiAgUHJvdG9GYWlsdXJlLFxuICBBcHBsaWNhdGlvbkZhaWx1cmUsXG59IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbic7XG5pbXBvcnQgeyBjb21wb3NlSW50ZXJjZXB0b3JzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHsgY2hlY2tFeHRlbmRzIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi90eXBlLWhlbHBlcnMnO1xuaW1wb3J0IHR5cGUgeyBjb3Jlc2RrLCB0ZW1wb3JhbCB9IGZyb20gJ0B0ZW1wb3JhbGlvL3Byb3RvJztcbmltcG9ydCB7IGFsZWEsIFJORyB9IGZyb20gJy4vYWxlYSc7XG5pbXBvcnQgeyBSb290Q2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yLCBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmLCBpc0NhbmNlbGxhdGlvbiB9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7IFF1ZXJ5SW5wdXQsIFNpZ25hbElucHV0LCBVcGRhdGVJbnB1dCwgV29ya2Zsb3dFeGVjdXRlSW5wdXQsIFdvcmtmbG93SW50ZXJjZXB0b3JzIH0gZnJvbSAnLi9pbnRlcmNlcHRvcnMnO1xuaW1wb3J0IHtcbiAgQ29udGludWVBc05ldyxcbiAgRGVmYXVsdFNpZ25hbEhhbmRsZXIsXG4gIFNES0luZm8sXG4gIEZpbGVTbGljZSxcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBGaWxlTG9jYXRpb24sXG4gIFdvcmtmbG93SW5mbyxcbiAgV29ya2Zsb3dDcmVhdGVPcHRpb25zSW50ZXJuYWwsXG59IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyB0eXBlIFNpbmtDYWxsIH0gZnJvbSAnLi9zaW5rcyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgcGtnIGZyb20gJy4vcGtnJztcbmltcG9ydCB7IGV4ZWN1dGVXaXRoTGlmZWN5Y2xlTG9nZ2luZyB9IGZyb20gJy4vbG9ncyc7XG5cbmVudW0gU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uRmFpbGVkQ2F1c2Uge1xuICBTVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1VOU1BFQ0lGSUVEID0gMCxcbiAgU1RBUlRfQ0hJTERfV09SS0ZMT1dfRVhFQ1VUSU9OX0ZBSUxFRF9DQVVTRV9XT1JLRkxPV19BTFJFQURZX0VYSVNUUyA9IDEsXG59XG5cbmNoZWNrRXh0ZW5kczxjb3Jlc2RrLmNoaWxkX3dvcmtmbG93LlN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbkZhaWxlZENhdXNlLCBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZT4oKTtcbmNoZWNrRXh0ZW5kczxTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZSwgY29yZXNkay5jaGlsZF93b3JrZmxvdy5TdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZT4oKTtcblxuZXhwb3J0IGludGVyZmFjZSBTdGFjayB7XG4gIGZvcm1hdHRlZDogc3RyaW5nO1xuICBzdHJ1Y3R1cmVkOiBGaWxlTG9jYXRpb25bXTtcbn1cblxuLyoqXG4gKiBHbG9iYWwgc3RvcmUgdG8gdHJhY2sgcHJvbWlzZSBzdGFja3MgZm9yIHN0YWNrIHRyYWNlIHF1ZXJ5XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUHJvbWlzZVN0YWNrU3RvcmUge1xuICBjaGlsZFRvUGFyZW50OiBNYXA8UHJvbWlzZTx1bmtub3duPiwgU2V0PFByb21pc2U8dW5rbm93bj4+PjtcbiAgcHJvbWlzZVRvU3RhY2s6IE1hcDxQcm9taXNlPHVua25vd24+LCBTdGFjaz47XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcGxldGlvbiB7XG4gIHJlc29sdmUodmFsOiB1bmtub3duKTogdW5rbm93bjtcbiAgcmVqZWN0KHJlYXNvbjogdW5rbm93bik6IHVua25vd247XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcbiAgZm4oKTogYm9vbGVhbjtcbiAgcmVzb2x2ZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgdHlwZSBBY3RpdmF0aW9uSGFuZGxlckZ1bmN0aW9uPEsgZXh0ZW5kcyBrZXlvZiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYj4gPSAoXG4gIGFjdGl2YXRpb246IE5vbk51bGxhYmxlPGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JV29ya2Zsb3dBY3RpdmF0aW9uSm9iW0tdPlxuKSA9PiB2b2lkO1xuXG4vKipcbiAqIFZlcmlmaWVzIGFsbCBhY3RpdmF0aW9uIGpvYiBoYW5kbGluZyBtZXRob2RzIGFyZSBpbXBsZW1lbnRlZFxuICovXG5leHBvcnQgdHlwZSBBY3RpdmF0aW9uSGFuZGxlciA9IHtcbiAgW1AgaW4ga2V5b2YgY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklXb3JrZmxvd0FjdGl2YXRpb25Kb2JdOiBBY3RpdmF0aW9uSGFuZGxlckZ1bmN0aW9uPFA+O1xufTtcblxuLyoqXG4gKiBLZWVwcyBhbGwgb2YgdGhlIFdvcmtmbG93IHJ1bnRpbWUgc3RhdGUgbGlrZSBwZW5kaW5nIGNvbXBsZXRpb25zIGZvciBhY3Rpdml0aWVzIGFuZCB0aW1lcnMuXG4gKlxuICogSW1wbGVtZW50cyBoYW5kbGVycyBmb3IgYWxsIHdvcmtmbG93IGFjdGl2YXRpb24gam9icy5cbiAqL1xuZXhwb3J0IGNsYXNzIEFjdGl2YXRvciBpbXBsZW1lbnRzIEFjdGl2YXRpb25IYW5kbGVyIHtcbiAgLyoqXG4gICAqIENhY2hlIGZvciBtb2R1bGVzIC0gcmVmZXJlbmNlZCBpbiByZXVzYWJsZS12bS50c1xuICAgKi9cbiAgcmVhZG9ubHkgbW9kdWxlQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgdW5rbm93bj4oKTtcbiAgLyoqXG4gICAqIE1hcCBvZiB0YXNrIHNlcXVlbmNlIHRvIGEgQ29tcGxldGlvblxuICAgKi9cbiAgcmVhZG9ubHkgY29tcGxldGlvbnMgPSB7XG4gICAgdGltZXI6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGFjdGl2aXR5OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgICBjaGlsZFdvcmtmbG93U3RhcnQ6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNoaWxkV29ya2Zsb3dDb21wbGV0ZTogbmV3IE1hcDxudW1iZXIsIENvbXBsZXRpb24+KCksXG4gICAgc2lnbmFsV29ya2Zsb3c6IG5ldyBNYXA8bnVtYmVyLCBDb21wbGV0aW9uPigpLFxuICAgIGNhbmNlbFdvcmtmbG93OiBuZXcgTWFwPG51bWJlciwgQ29tcGxldGlvbj4oKSxcbiAgfTtcblxuICAvKipcbiAgICogSG9sZHMgYnVmZmVyZWQgVXBkYXRlIGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkXG4gICAqL1xuICByZWFkb25seSBidWZmZXJlZFVwZGF0ZXMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlPigpO1xuXG4gIC8qKlxuICAgKiBIb2xkcyBidWZmZXJlZCBzaWduYWwgY2FsbHMgdW50aWwgYSBoYW5kbGVyIGlzIHJlZ2lzdGVyZWRcbiAgICovXG4gIHJlYWRvbmx5IGJ1ZmZlcmVkU2lnbmFscyA9IEFycmF5PGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JU2lnbmFsV29ya2Zsb3c+KCk7XG5cbiAgLyoqXG4gICAqIEhvbGRzIGJ1ZmZlcmVkIHF1ZXJ5IGNhbGxzIHVudGlsIGEgaGFuZGxlciBpcyByZWdpc3RlcmVkLlxuICAgKlxuICAgKiAqKklNUE9SVEFOVCoqIHF1ZXJpZXMgYXJlIG9ubHkgYnVmZmVyZWQgdW50aWwgd29ya2Zsb3cgaXMgc3RhcnRlZC5cbiAgICogVGhpcyBpcyByZXF1aXJlZCBiZWNhdXNlIGFzeW5jIGludGVyY2VwdG9ycyBtaWdodCBibG9jayB3b3JrZmxvdyBmdW5jdGlvbiBpbnZvY2F0aW9uXG4gICAqIHdoaWNoIGRlbGF5cyBxdWVyeSBoYW5kbGVyIHJlZ2lzdHJhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCByZWFkb25seSBidWZmZXJlZFF1ZXJpZXMgPSBBcnJheTxjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVF1ZXJ5V29ya2Zsb3c+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2YgdXBkYXRlIG5hbWUgdG8gaGFuZGxlciBhbmQgdmFsaWRhdG9yXG4gICAqL1xuICByZWFkb25seSB1cGRhdGVIYW5kbGVycyA9IG5ldyBNYXA8c3RyaW5nLCBXb3JrZmxvd1VwZGF0ZUFubm90YXRlZFR5cGU+KCk7XG5cbiAgLyoqXG4gICAqIE1hcHBpbmcgb2Ygc2lnbmFsIG5hbWUgdG8gaGFuZGxlclxuICAgKi9cbiAgcmVhZG9ubHkgc2lnbmFsSGFuZGxlcnMgPSBuZXcgTWFwPHN0cmluZywgV29ya2Zsb3dTaWduYWxBbm5vdGF0ZWRUeXBlPigpO1xuXG4gIC8qKlxuICAgKiBBIHNpZ25hbCBoYW5kbGVyIHRoYXQgY2F0Y2hlcyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICAgKi9cbiAgZGVmYXVsdFNpZ25hbEhhbmRsZXI/OiBEZWZhdWx0U2lnbmFsSGFuZGxlcjtcblxuICAvKipcbiAgICogU291cmNlIG1hcCBmaWxlIGZvciBsb29raW5nIHVwIHRoZSBzb3VyY2UgZmlsZXMgaW4gcmVzcG9uc2UgdG8gX19lbmhhbmNlZF9zdGFja190cmFjZVxuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNvdXJjZU1hcDogUmF3U291cmNlTWFwO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIG9yIG5vdCB0byBzZW5kIHRoZSBzb3VyY2VzIGluIGVuaGFuY2VkIHN0YWNrIHRyYWNlIHF1ZXJ5IHJlc3BvbnNlc1xuICAgKi9cbiAgcHJvdGVjdGVkIHJlYWRvbmx5IHNob3dTdGFja1RyYWNlU291cmNlcztcblxuICByZWFkb25seSBwcm9taXNlU3RhY2tTdG9yZTogUHJvbWlzZVN0YWNrU3RvcmUgPSB7XG4gICAgcHJvbWlzZVRvU3RhY2s6IG5ldyBNYXAoKSxcbiAgICBjaGlsZFRvUGFyZW50OiBuZXcgTWFwKCksXG4gIH07XG5cbiAgcHVibGljIHJlYWRvbmx5IHJvb3RTY29wZSA9IG5ldyBSb290Q2FuY2VsbGF0aW9uU2NvcGUoKTtcblxuICAvKipcbiAgICogTWFwcGluZyBvZiBxdWVyeSBuYW1lIHRvIGhhbmRsZXJcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBxdWVyeUhhbmRsZXJzID0gbmV3IE1hcDxzdHJpbmcsIFdvcmtmbG93UXVlcnlBbm5vdGF0ZWRUeXBlPihbXG4gICAgW1xuICAgICAgJ19fc3RhY2tfdHJhY2UnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RhY2tUcmFjZXMoKVxuICAgICAgICAgICAgLm1hcCgocykgPT4gcy5mb3JtYXR0ZWQpXG4gICAgICAgICAgICAuam9pbignXFxuXFxuJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBhIHNlbnNpYmxlIHN0YWNrIHRyYWNlLicsXG4gICAgICB9LFxuICAgIF0sXG4gICAgW1xuICAgICAgJ19fZW5oYW5jZWRfc3RhY2tfdHJhY2UnLFxuICAgICAge1xuICAgICAgICBoYW5kbGVyOiAoKTogRW5oYW5jZWRTdGFja1RyYWNlID0+IHtcbiAgICAgICAgICBjb25zdCB7IHNvdXJjZU1hcCB9ID0gdGhpcztcbiAgICAgICAgICBjb25zdCBzZGs6IFNES0luZm8gPSB7IG5hbWU6ICd0eXBlc2NyaXB0JywgdmVyc2lvbjogcGtnLnZlcnNpb24gfTtcbiAgICAgICAgICBjb25zdCBzdGFja3MgPSB0aGlzLmdldFN0YWNrVHJhY2VzKCkubWFwKCh7IHN0cnVjdHVyZWQ6IGxvY2F0aW9ucyB9KSA9PiAoeyBsb2NhdGlvbnMgfSkpO1xuICAgICAgICAgIGNvbnN0IHNvdXJjZXM6IFJlY29yZDxzdHJpbmcsIEZpbGVTbGljZVtdPiA9IHt9O1xuICAgICAgICAgIGlmICh0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcykge1xuICAgICAgICAgICAgZm9yIChjb25zdCB7IGxvY2F0aW9ucyB9IG9mIHN0YWNrcykge1xuICAgICAgICAgICAgICBmb3IgKGNvbnN0IHsgZmlsZVBhdGggfSBvZiBsb2NhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWZpbGVQYXRoKSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZW50ID0gc291cmNlTWFwPy5zb3VyY2VzQ29udGVudD8uW3NvdXJjZU1hcD8uc291cmNlcy5pbmRleE9mKGZpbGVQYXRoKV07XG4gICAgICAgICAgICAgICAgaWYgKCFjb250ZW50KSBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBzb3VyY2VzW2ZpbGVQYXRoXSA9IFtcbiAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudCxcbiAgICAgICAgICAgICAgICAgICAgbGluZU9mZnNldDogMCxcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4geyBzZGssIHN0YWNrcywgc291cmNlcyB9O1xuICAgICAgICB9LFxuICAgICAgICBkZXNjcmlwdGlvbjogJ1JldHVybnMgYSBzdGFjayB0cmFjZSBhbm5vdGF0ZWQgd2l0aCBzb3VyY2UgaW5mb3JtYXRpb24uJyxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBbXG4gICAgICAnX190ZW1wb3JhbF93b3JrZmxvd19tZXRhZGF0YScsXG4gICAgICB7XG4gICAgICAgIGhhbmRsZXI6ICgpOiB0ZW1wb3JhbC5hcGkuc2RrLnYxLklXb3JrZmxvd01ldGFkYXRhID0+IHtcbiAgICAgICAgICBjb25zdCB3b3JrZmxvd1R5cGUgPSB0aGlzLmluZm8ud29ya2Zsb3dUeXBlO1xuICAgICAgICAgIGNvbnN0IHF1ZXJ5RGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMucXVlcnlIYW5kbGVycy5lbnRyaWVzKCkpLm1hcCgoW25hbWUsIHZhbHVlXSkgPT4gKHtcbiAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdmFsdWUuZGVzY3JpcHRpb24sXG4gICAgICAgICAgfSkpO1xuICAgICAgICAgIGNvbnN0IHNpZ25hbERlZmluaXRpb25zID0gQXJyYXkuZnJvbSh0aGlzLnNpZ25hbEhhbmRsZXJzLmVudHJpZXMoKSkubWFwKChbbmFtZSwgdmFsdWVdKSA9PiAoe1xuICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB2YWx1ZS5kZXNjcmlwdGlvbixcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgY29uc3QgdXBkYXRlRGVmaW5pdGlvbnMgPSBBcnJheS5mcm9tKHRoaXMudXBkYXRlSGFuZGxlcnMuZW50cmllcygpKS5tYXAoKFtuYW1lLCB2YWx1ZV0pID0+ICh7XG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHZhbHVlLmRlc2NyaXB0aW9uLFxuICAgICAgICAgIH0pKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZGVmaW5pdGlvbjoge1xuICAgICAgICAgICAgICB0eXBlOiB3b3JrZmxvd1R5cGUsXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBudWxsLCAvLyBGb3Igbm93LCBkbyBub3Qgc2V0IHRoZSB3b3JrZmxvdyBkZXNjcmlwdGlvbiBpbiB0aGUgVFMgU0RLLlxuICAgICAgICAgICAgICBxdWVyeURlZmluaXRpb25zLFxuICAgICAgICAgICAgICBzaWduYWxEZWZpbml0aW9ucyxcbiAgICAgICAgICAgICAgdXBkYXRlRGVmaW5pdGlvbnMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGRlc2NyaXB0aW9uOiAnUmV0dXJucyBtZXRhZGF0YSBhc3NvY2lhdGVkIHdpdGggdGhpcyB3b3JrZmxvdy4nLFxuICAgICAgfSxcbiAgICBdLFxuICBdKTtcblxuICAvKipcbiAgICogTG9hZGVkIGluIHtAbGluayBpbml0UnVudGltZX1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBpbnRlcmNlcHRvcnM6IFJlcXVpcmVkPFdvcmtmbG93SW50ZXJjZXB0b3JzPiA9IHsgaW5ib3VuZDogW10sIG91dGJvdW5kOiBbXSwgaW50ZXJuYWxzOiBbXSB9O1xuXG4gIC8qKlxuICAgKiBCdWZmZXIgdGhhdCBzdG9yZXMgYWxsIGdlbmVyYXRlZCBjb21tYW5kcywgcmVzZXQgYWZ0ZXIgZWFjaCBhY3RpdmF0aW9uXG4gICAqL1xuICBwcm90ZWN0ZWQgY29tbWFuZHM6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdID0gW107XG5cbiAgLyoqXG4gICAqIFN0b3JlcyBhbGwge0BsaW5rIGNvbmRpdGlvbn1zIHRoYXQgaGF2ZW4ndCBiZWVuIHVuYmxvY2tlZCB5ZXRcbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBibG9ja2VkQ29uZGl0aW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBDb25kaXRpb24+KCk7XG5cbiAgLyoqXG4gICAqIElzIHRoaXMgV29ya2Zsb3cgY29tcGxldGVkP1xuICAgKlxuICAgKiBBIFdvcmtmbG93IHdpbGwgYmUgY29uc2lkZXJlZCBjb21wbGV0ZWQgaWYgaXQgZ2VuZXJhdGVzIGEgY29tbWFuZCB0aGF0IHRoZVxuICAgKiBzeXN0ZW0gY29uc2lkZXJzIGFzIGEgZmluYWwgV29ya2Zsb3cgY29tbWFuZCAoZS5nLlxuICAgKiBjb21wbGV0ZVdvcmtmbG93RXhlY3V0aW9uIG9yIGZhaWxXb3JrZmxvd0V4ZWN1dGlvbikuXG4gICAqL1xuICBwdWJsaWMgY29tcGxldGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFdhcyB0aGlzIFdvcmtmbG93IGNhbmNlbGxlZD9cbiAgICovXG4gIHByb3RlY3RlZCBjYW5jZWxsZWQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhpcyBpcyB0cmFja2VkIHRvIGFsbG93IGJ1ZmZlcmluZyBxdWVyaWVzIHVudGlsIGEgd29ya2Zsb3cgZnVuY3Rpb24gaXMgY2FsbGVkLlxuICAgKiBUT0RPKGJlcmd1bmR5KTogSSBkb24ndCB0aGluayB0aGlzIG1ha2VzIHNlbnNlIHNpbmNlIHF1ZXJpZXMgcnVuIGxhc3QgaW4gYW4gYWN0aXZhdGlvbiBhbmQgbXVzdCBiZSByZXNwb25kZWQgdG8gaW5cbiAgICogdGhlIHNhbWUgYWN0aXZhdGlvbi5cbiAgICovXG4gIHByb3RlY3RlZCB3b3JrZmxvd0Z1bmN0aW9uV2FzQ2FsbGVkID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFRoZSBuZXh0IChpbmNyZW1lbnRhbCkgc2VxdWVuY2UgdG8gYXNzaWduIHdoZW4gZ2VuZXJhdGluZyBjb21wbGV0YWJsZSBjb21tYW5kc1xuICAgKi9cbiAgcHVibGljIG5leHRTZXFzID0ge1xuICAgIHRpbWVyOiAxLFxuICAgIGFjdGl2aXR5OiAxLFxuICAgIGNoaWxkV29ya2Zsb3c6IDEsXG4gICAgc2lnbmFsV29ya2Zsb3c6IDEsXG4gICAgY2FuY2VsV29ya2Zsb3c6IDEsXG4gICAgY29uZGl0aW9uOiAxLFxuICAgIC8vIFVzZWQgaW50ZXJuYWxseSB0byBrZWVwIHRyYWNrIG9mIGFjdGl2ZSBzdGFjayB0cmFjZXNcbiAgICBzdGFjazogMSxcbiAgfTtcblxuICAvKipcbiAgICogVGhpcyBpcyBzZXQgZXZlcnkgdGltZSB0aGUgd29ya2Zsb3cgZXhlY3V0ZXMgYW4gYWN0aXZhdGlvblxuICAgKi9cbiAgbm93OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIFJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBXb3JrZmxvdywgaW5pdGlhbGl6ZWQgd2hlbiBhIFdvcmtmbG93IGlzIHN0YXJ0ZWRcbiAgICovXG4gIHB1YmxpYyB3b3JrZmxvdz86IFdvcmtmbG93O1xuXG4gIC8qKlxuICAgKiBJbmZvcm1hdGlvbiBhYm91dCB0aGUgY3VycmVudCBXb3JrZmxvd1xuICAgKi9cbiAgcHVibGljIGluZm86IFdvcmtmbG93SW5mbztcblxuICAvKipcbiAgICogQSBkZXRlcm1pbmlzdGljIFJORywgdXNlZCBieSB0aGUgaXNvbGF0ZSdzIG92ZXJyaWRkZW4gTWF0aC5yYW5kb21cbiAgICovXG4gIHB1YmxpYyByYW5kb206IFJORztcblxuICBwdWJsaWMgcGF5bG9hZENvbnZlcnRlcjogUGF5bG9hZENvbnZlcnRlciA9IGRlZmF1bHRQYXlsb2FkQ29udmVydGVyO1xuICBwdWJsaWMgZmFpbHVyZUNvbnZlcnRlcjogRmFpbHVyZUNvbnZlcnRlciA9IGRlZmF1bHRGYWlsdXJlQ29udmVydGVyO1xuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHdlIGtub3cgdGhlIHN0YXR1cyBvZiBmb3IgdGhpcyB3b3JrZmxvdywgYXMgaW4ge0BsaW5rIHBhdGNoZWR9XG4gICAqL1xuICBwdWJsaWMgcmVhZG9ubHkga25vd25QcmVzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8qKlxuICAgKiBQYXRjaGVzIHdlIHNlbnQgdG8gY29yZSB7QGxpbmsgcGF0Y2hlZH1cbiAgICovXG4gIHB1YmxpYyByZWFkb25seSBzZW50UGF0Y2hlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIC8qKlxuICAgKiBCdWZmZXJlZCBzaW5rIGNhbGxzIHBlciBhY3RpdmF0aW9uXG4gICAqL1xuICBzaW5rQ2FsbHMgPSBBcnJheTxTaW5rQ2FsbD4oKTtcblxuICAvKipcbiAgICogQSBuYW5vc2Vjb25kIHJlc29sdXRpb24gdGltZSBmdW5jdGlvbiwgZXh0ZXJuYWxseSBpbmplY3RlZFxuICAgKi9cbiAgcHVibGljIHJlYWRvbmx5IGdldFRpbWVPZkRheTogKCkgPT4gYmlnaW50O1xuXG4gIHB1YmxpYyByZWFkb25seSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lczogU2V0PHN0cmluZz47XG5cbiAgY29uc3RydWN0b3Ioe1xuICAgIGluZm8sXG4gICAgbm93LFxuICAgIHNob3dTdGFja1RyYWNlU291cmNlcyxcbiAgICBzb3VyY2VNYXAsXG4gICAgZ2V0VGltZU9mRGF5LFxuICAgIHJhbmRvbW5lc3NTZWVkLFxuICAgIHBhdGNoZXMsXG4gICAgcmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMsXG4gIH06IFdvcmtmbG93Q3JlYXRlT3B0aW9uc0ludGVybmFsKSB7XG4gICAgdGhpcy5nZXRUaW1lT2ZEYXkgPSBnZXRUaW1lT2ZEYXk7XG4gICAgdGhpcy5pbmZvID0gaW5mbztcbiAgICB0aGlzLm5vdyA9IG5vdztcbiAgICB0aGlzLnNob3dTdGFja1RyYWNlU291cmNlcyA9IHNob3dTdGFja1RyYWNlU291cmNlcztcbiAgICB0aGlzLnNvdXJjZU1hcCA9IHNvdXJjZU1hcDtcbiAgICB0aGlzLnJhbmRvbSA9IGFsZWEocmFuZG9tbmVzc1NlZWQpO1xuICAgIHRoaXMucmVnaXN0ZXJlZEFjdGl2aXR5TmFtZXMgPSByZWdpc3RlcmVkQWN0aXZpdHlOYW1lcztcblxuICAgIGlmIChpbmZvLnVuc2FmZS5pc1JlcGxheWluZykge1xuICAgICAgZm9yIChjb25zdCBwYXRjaElkIG9mIHBhdGNoZXMpIHtcbiAgICAgICAgdGhpcy5ub3RpZnlIYXNQYXRjaCh7IHBhdGNoSWQgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbXV0YXRlV29ya2Zsb3dJbmZvKGZuOiAoaW5mbzogV29ya2Zsb3dJbmZvKSA9PiBXb3JrZmxvd0luZm8pOiB2b2lkIHtcbiAgICB0aGlzLmluZm8gPSBmbih0aGlzLmluZm8pO1xuICB9XG5cbiAgcHJvdGVjdGVkIGdldFN0YWNrVHJhY2VzKCk6IFN0YWNrW10ge1xuICAgIGNvbnN0IHsgY2hpbGRUb1BhcmVudCwgcHJvbWlzZVRvU3RhY2sgfSA9IHRoaXMucHJvbWlzZVN0YWNrU3RvcmU7XG4gICAgY29uc3QgaW50ZXJuYWxOb2RlcyA9IFsuLi5jaGlsZFRvUGFyZW50LnZhbHVlcygpXS5yZWR1Y2UoKGFjYywgY3VycikgPT4ge1xuICAgICAgZm9yIChjb25zdCBwIG9mIGN1cnIpIHtcbiAgICAgICAgYWNjLmFkZChwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBhY2M7XG4gICAgfSwgbmV3IFNldCgpKTtcbiAgICBjb25zdCBzdGFja3MgPSBuZXcgTWFwPHN0cmluZywgU3RhY2s+KCk7XG4gICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZFRvUGFyZW50LmtleXMoKSkge1xuICAgICAgaWYgKCFpbnRlcm5hbE5vZGVzLmhhcyhjaGlsZCkpIHtcbiAgICAgICAgY29uc3Qgc3RhY2sgPSBwcm9taXNlVG9TdGFjay5nZXQoY2hpbGQpO1xuICAgICAgICBpZiAoIXN0YWNrIHx8ICFzdGFjay5mb3JtYXR0ZWQpIGNvbnRpbnVlO1xuICAgICAgICBzdGFja3Muc2V0KHN0YWNrLmZvcm1hdHRlZCwgc3RhY2spO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBOb3QgMTAwJSBzdXJlIHdoZXJlIHRoaXMgY29tZXMgZnJvbSwganVzdCBmaWx0ZXIgaXQgb3V0XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pJyk7XG4gICAgc3RhY2tzLmRlbGV0ZSgnICAgIGF0IFByb21pc2UudGhlbiAoPGFub255bW91cz4pXFxuJyk7XG4gICAgcmV0dXJuIFsuLi5zdGFja3NdLm1hcCgoW18sIHN0YWNrXSkgPT4gc3RhY2spO1xuICB9XG5cbiAgZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTogU2lua0NhbGxbXSB7XG4gICAgY29uc3QgeyBzaW5rQ2FsbHMgfSA9IHRoaXM7XG4gICAgdGhpcy5zaW5rQ2FsbHMgPSBbXTtcbiAgICByZXR1cm4gc2lua0NhbGxzO1xuICB9XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIFdvcmtmbG93IGNvbW1hbmQgdG8gYmUgY29sbGVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIGN1cnJlbnQgYWN0aXZhdGlvbi5cbiAgICpcbiAgICogUHJldmVudHMgY29tbWFuZHMgZnJvbSBiZWluZyBhZGRlZCBhZnRlciBXb3JrZmxvdyBjb21wbGV0aW9uLlxuICAgKi9cbiAgcHVzaENvbW1hbmQoY21kOiBjb3Jlc2RrLndvcmtmbG93X2NvbW1hbmRzLklXb3JrZmxvd0NvbW1hbmQsIGNvbXBsZXRlID0gZmFsc2UpOiB2b2lkIHtcbiAgICAvLyBPbmx5IHF1ZXJ5IHJlc3BvbnNlcyBtYXkgYmUgc2VudCBhZnRlciBjb21wbGV0aW9uXG4gICAgaWYgKHRoaXMuY29tcGxldGVkICYmICFjbWQucmVzcG9uZFRvUXVlcnkpIHJldHVybjtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goY21kKTtcbiAgICBpZiAoY29tcGxldGUpIHtcbiAgICAgIHRoaXMuY29tcGxldGVkID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBnZXRBbmRSZXNldENvbW1hbmRzKCk6IGNvcmVzZGsud29ya2Zsb3dfY29tbWFuZHMuSVdvcmtmbG93Q29tbWFuZFtdIHtcbiAgICBjb25zdCBjb21tYW5kcyA9IHRoaXMuY29tbWFuZHM7XG4gICAgdGhpcy5jb21tYW5kcyA9IFtdO1xuICAgIHJldHVybiBjb21tYW5kcztcbiAgfVxuXG4gIHB1YmxpYyBhc3luYyBzdGFydFdvcmtmbG93TmV4dEhhbmRsZXIoeyBhcmdzIH06IFdvcmtmbG93RXhlY3V0ZUlucHV0KTogUHJvbWlzZTxhbnk+IHtcbiAgICBjb25zdCB7IHdvcmtmbG93IH0gPSB0aGlzO1xuICAgIGlmICh3b3JrZmxvdyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1dvcmtmbG93IHVuaW5pdGlhbGl6ZWQnKTtcbiAgICB9XG4gICAgbGV0IHByb21pc2U6IFByb21pc2U8YW55PjtcbiAgICB0cnkge1xuICAgICAgcHJvbWlzZSA9IHdvcmtmbG93KC4uLmFyZ3MpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICAvLyBRdWVyaWVzIG11c3QgYmUgaGFuZGxlZCBldmVuIGlmIHRoZXJlIHdhcyBhbiBleGNlcHRpb24gd2hlbiBpbnZva2luZyB0aGUgV29ya2Zsb3cgZnVuY3Rpb24uXG4gICAgICB0aGlzLndvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQgPSB0cnVlO1xuICAgICAgLy8gRW1wdHkgdGhlIGJ1ZmZlclxuICAgICAgY29uc3QgYnVmZmVyID0gdGhpcy5idWZmZXJlZFF1ZXJpZXMuc3BsaWNlKDApO1xuICAgICAgZm9yIChjb25zdCBhY3RpdmF0aW9uIG9mIGJ1ZmZlcikge1xuICAgICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhd2FpdCBwcm9taXNlO1xuICB9XG5cbiAgcHVibGljIHN0YXJ0V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklTdGFydFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnModGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCwgJ2V4ZWN1dGUnLCB0aGlzLnN0YXJ0V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpKTtcblxuICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nKCgpID0+XG4gICAgICAgIGV4ZWN1dGUoe1xuICAgICAgICAgIGhlYWRlcnM6IGFjdGl2YXRpb24uaGVhZGVycyA/PyB7fSxcbiAgICAgICAgICBhcmdzOiBhcnJheUZyb21QYXlsb2Fkcyh0aGlzLnBheWxvYWRDb252ZXJ0ZXIsIGFjdGl2YXRpb24uYXJndW1lbnRzKSxcbiAgICAgICAgfSlcbiAgICAgICkudGhlbih0aGlzLmNvbXBsZXRlV29ya2Zsb3cuYmluZCh0aGlzKSwgdGhpcy5oYW5kbGVXb3JrZmxvd0ZhaWx1cmUuYmluZCh0aGlzKSlcbiAgICApO1xuICB9XG5cbiAgcHVibGljIGNhbmNlbFdvcmtmbG93KF9hY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUNhbmNlbFdvcmtmbG93KTogdm9pZCB7XG4gICAgdGhpcy5jYW5jZWxsZWQgPSB0cnVlO1xuICAgIHRoaXMucm9vdFNjb3BlLmNhbmNlbCgpO1xuICB9XG5cbiAgcHVibGljIGZpcmVUaW1lcihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSUZpcmVUaW1lcik6IHZvaWQge1xuICAgIC8vIFRpbWVycyBhcmUgYSBzcGVjaWFsIGNhc2Ugd2hlcmUgdGhlaXIgY29tcGxldGlvbiBtaWdodCBub3QgYmUgaW4gV29ya2Zsb3cgc3RhdGUsXG4gICAgLy8gdGhpcyBpcyBkdWUgdG8gaW1tZWRpYXRlIHRpbWVyIGNhbmNlbGxhdGlvbiB0aGF0IGRvZXNuJ3QgZ28gd2FpdCBmb3IgQ29yZS5cbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5tYXliZUNvbnN1bWVDb21wbGV0aW9uKCd0aW1lcicsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgY29tcGxldGlvbj8ucmVzb2x2ZSh1bmRlZmluZWQpO1xuICB9XG5cbiAgcHVibGljIHJlc29sdmVBY3Rpdml0eShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVBY3Rpdml0eSk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5yZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBSZXNvbHZlQWN0aXZpdHkgYWN0aXZhdGlvbiB3aXRoIG5vIHJlc3VsdCcpO1xuICAgIH1cbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignYWN0aXZpdHknLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5jb21wbGV0ZWQpIHtcbiAgICAgIGNvbnN0IGNvbXBsZXRlZCA9IGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZDtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGNvbXBsZXRlZC5yZXN1bHQgPyB0aGlzLnBheWxvYWRDb252ZXJ0ZXIuZnJvbVBheWxvYWQoY29tcGxldGVkLnJlc3VsdCkgOiB1bmRlZmluZWQ7XG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSBlbHNlIGlmIChhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQpIHtcbiAgICAgIGNvbnN0IHsgZmFpbHVyZSB9ID0gYWN0aXZhdGlvbi5yZXN1bHQuZmFpbGVkO1xuICAgICAgY29uc3QgZXJyID0gZmFpbHVyZSA/IHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkgOiB1bmRlZmluZWQ7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5jYW5jZWxsZWQ7XG4gICAgICBjb25zdCBlcnIgPSBmYWlsdXJlID8gdGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuYmFja29mZikge1xuICAgICAgcmVqZWN0KG5ldyBMb2NhbEFjdGl2aXR5RG9CYWNrb2ZmKGFjdGl2YXRpb24ucmVzdWx0LmJhY2tvZmYpKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgcmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydChcbiAgICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uU3RhcnRcbiAgKTogdm9pZCB7XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dTdGFydCcsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24uc3VjY2VlZGVkKSB7XG4gICAgICByZXNvbHZlKGFjdGl2YXRpb24uc3VjY2VlZGVkLnJ1bklkKTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24uZmFpbGVkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLmNhdXNlICE9PVxuICAgICAgICBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZS5TVEFSVF9DSElMRF9XT1JLRkxPV19FWEVDVVRJT05fRkFJTEVEX0NBVVNFX1dPUktGTE9XX0FMUkVBRFlfRVhJU1RTXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdHb3QgdW5rbm93biBTdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25GYWlsZWRDYXVzZScpO1xuICAgICAgfVxuICAgICAgaWYgKCEoYWN0aXZhdGlvbi5zZXEgJiYgYWN0aXZhdGlvbi5mYWlsZWQud29ya2Zsb3dJZCAmJiBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd1R5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYXR0cmlidXRlcyBpbiBhY3RpdmF0aW9uIGpvYicpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KFxuICAgICAgICBuZXcgV29ya2Zsb3dFeGVjdXRpb25BbHJlYWR5U3RhcnRlZEVycm9yKFxuICAgICAgICAgICdXb3JrZmxvdyBleGVjdXRpb24gYWxyZWFkeSBzdGFydGVkJyxcbiAgICAgICAgICBhY3RpdmF0aW9uLmZhaWxlZC53b3JrZmxvd0lkLFxuICAgICAgICAgIGFjdGl2YXRpb24uZmFpbGVkLndvcmtmbG93VHlwZVxuICAgICAgICApXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5jYW5jZWxsZWQpIHtcbiAgICAgIGlmICghYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3Qgbm8gZmFpbHVyZSBpbiBjYW5jZWxsZWQgdmFyaWFudCcpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoYWN0aXZhdGlvbi5jYW5jZWxsZWQuZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgUmVzb2x2ZUNoaWxkV29ya2Zsb3dFeGVjdXRpb25TdGFydCB3aXRoIG5vIHN0YXR1cycpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZXNvbHZlQ2hpbGRXb3JrZmxvd0V4ZWN1dGlvbihhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJlc3VsdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IFJlc29sdmVDaGlsZFdvcmtmbG93RXhlY3V0aW9uIGFjdGl2YXRpb24gd2l0aCBubyByZXN1bHQnKTtcbiAgICB9XG4gICAgY29uc3QgeyByZXNvbHZlLCByZWplY3QgfSA9IHRoaXMuY29uc3VtZUNvbXBsZXRpb24oJ2NoaWxkV29ya2Zsb3dDb21wbGV0ZScsIGdldFNlcShhY3RpdmF0aW9uKSk7XG4gICAgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmNvbXBsZXRlZCkge1xuICAgICAgY29uc3QgY29tcGxldGVkID0gYWN0aXZhdGlvbi5yZXN1bHQuY29tcGxldGVkO1xuICAgICAgY29uc3QgcmVzdWx0ID0gY29tcGxldGVkLnJlc3VsdCA/IHRoaXMucGF5bG9hZENvbnZlcnRlci5mcm9tUGF5bG9hZChjb21wbGV0ZWQucmVzdWx0KSA6IHVuZGVmaW5lZDtcbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9IGVsc2UgaWYgKGFjdGl2YXRpb24ucmVzdWx0LmZhaWxlZCkge1xuICAgICAgY29uc3QgeyBmYWlsdXJlIH0gPSBhY3RpdmF0aW9uLnJlc3VsdC5mYWlsZWQ7XG4gICAgICBpZiAoZmFpbHVyZSA9PT0gdW5kZWZpbmVkIHx8IGZhaWx1cmUgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGZhaWxlZCByZXN1bHQgd2l0aCBubyBmYWlsdXJlIGF0dHJpYnV0ZScpO1xuICAgICAgfVxuICAgICAgcmVqZWN0KHRoaXMuZmFpbHVyZVRvRXJyb3IoZmFpbHVyZSkpO1xuICAgIH0gZWxzZSBpZiAoYWN0aXZhdGlvbi5yZXN1bHQuY2FuY2VsbGVkKSB7XG4gICAgICBjb25zdCB7IGZhaWx1cmUgfSA9IGFjdGl2YXRpb24ucmVzdWx0LmNhbmNlbGxlZDtcbiAgICAgIGlmIChmYWlsdXJlID09PSB1bmRlZmluZWQgfHwgZmFpbHVyZSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgY2FuY2VsbGVkIHJlc3VsdCB3aXRoIG5vIGZhaWx1cmUgYXR0cmlidXRlJyk7XG4gICAgICB9XG4gICAgICByZWplY3QodGhpcy5mYWlsdXJlVG9FcnJvcihmYWlsdXJlKSk7XG4gICAgfVxuICB9XG5cbiAgLy8gSW50ZW50aW9uYWxseSBub24tYXN5bmMgZnVuY3Rpb24gc28gdGhpcyBoYW5kbGVyIGRvZXNuJ3Qgc2hvdyB1cCBpbiB0aGUgc3RhY2sgdHJhY2VcbiAgcHJvdGVjdGVkIHF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlcih7IHF1ZXJ5TmFtZSwgYXJncyB9OiBRdWVyeUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnF1ZXJ5SGFuZGxlcnMuZ2V0KHF1ZXJ5TmFtZSk/LmhhbmRsZXI7XG4gICAgaWYgKGZuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGtub3duUXVlcnlUeXBlcyA9IFsuLi50aGlzLnF1ZXJ5SGFuZGxlcnMua2V5cygpXS5qb2luKCcgJyk7XG4gICAgICAvLyBGYWlsIHRoZSBxdWVyeVxuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KFxuICAgICAgICBuZXcgUmVmZXJlbmNlRXJyb3IoXG4gICAgICAgICAgYFdvcmtmbG93IGRpZCBub3QgcmVnaXN0ZXIgYSBoYW5kbGVyIGZvciAke3F1ZXJ5TmFtZX0uIFJlZ2lzdGVyZWQgcXVlcmllczogWyR7a25vd25RdWVyeVR5cGVzfV1gXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXQgPSBmbiguLi5hcmdzKTtcbiAgICAgIGlmIChyZXQgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRGV0ZXJtaW5pc21WaW9sYXRpb25FcnJvcignUXVlcnkgaGFuZGxlcnMgc2hvdWxkIG5vdCByZXR1cm4gYSBQcm9taXNlJykpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShyZXQpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHF1ZXJ5V29ya2Zsb3coYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklRdWVyeVdvcmtmbG93KTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLndvcmtmbG93RnVuY3Rpb25XYXNDYWxsZWQpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRRdWVyaWVzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgeyBxdWVyeVR5cGUsIHF1ZXJ5SWQsIGhlYWRlcnMgfSA9IGFjdGl2YXRpb247XG4gICAgaWYgKCEocXVlcnlUeXBlICYmIHF1ZXJ5SWQpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIHF1ZXJ5IGFjdGl2YXRpb24gYXR0cmlidXRlcycpO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVRdWVyeScsXG4gICAgICB0aGlzLnF1ZXJ5V29ya2Zsb3dOZXh0SGFuZGxlci5iaW5kKHRoaXMpXG4gICAgKTtcbiAgICBleGVjdXRlKHtcbiAgICAgIHF1ZXJ5TmFtZTogcXVlcnlUeXBlLFxuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmFyZ3VtZW50cyksXG4gICAgICBxdWVyeUlkLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KS50aGVuKFxuICAgICAgKHJlc3VsdCkgPT4gdGhpcy5jb21wbGV0ZVF1ZXJ5KHF1ZXJ5SWQsIHJlc3VsdCksXG4gICAgICAocmVhc29uKSA9PiB0aGlzLmZhaWxRdWVyeShxdWVyeUlkLCByZWFzb24pXG4gICAgKTtcbiAgfVxuXG4gIHB1YmxpYyBkb1VwZGF0ZShhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSURvVXBkYXRlKTogdm9pZCB7XG4gICAgY29uc3QgeyBpZDogdXBkYXRlSWQsIHByb3RvY29sSW5zdGFuY2VJZCwgbmFtZSwgaGVhZGVycywgcnVuVmFsaWRhdG9yIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghdXBkYXRlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgaWQnKTtcbiAgICB9XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNaXNzaW5nIGFjdGl2YXRpb24gdXBkYXRlIG5hbWUnKTtcbiAgICB9XG4gICAgaWYgKCFwcm90b2NvbEluc3RhbmNlSWQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ01pc3NpbmcgYWN0aXZhdGlvbiB1cGRhdGUgcHJvdG9jb2xJbnN0YW5jZUlkJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy51cGRhdGVIYW5kbGVycy5oYXMobmFtZSkpIHtcbiAgICAgIHRoaXMuYnVmZmVyZWRVcGRhdGVzLnB1c2goYWN0aXZhdGlvbik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbWFrZUlucHV0ID0gKCk6IFVwZGF0ZUlucHV0ID0+ICh7XG4gICAgICB1cGRhdGVJZCxcbiAgICAgIGFyZ3M6IGFycmF5RnJvbVBheWxvYWRzKHRoaXMucGF5bG9hZENvbnZlcnRlciwgYWN0aXZhdGlvbi5pbnB1dCksXG4gICAgICBuYW1lLFxuICAgICAgaGVhZGVyczogaGVhZGVycyA/PyB7fSxcbiAgICB9KTtcblxuICAgIC8vIFRoZSBpbXBsZW1lbnRhdGlvbiBiZWxvdyBpcyByZXNwb25zaWJsZSBmb3IgdXBob2xkaW5nLCBhbmQgY29uc3RyYWluZWRcbiAgICAvLyBieSwgdGhlIGZvbGxvd2luZyBjb250cmFjdDpcbiAgICAvL1xuICAgIC8vIDEuIElmIG5vIHZhbGlkYXRvciBpcyBwcmVzZW50IHRoZW4gdmFsaWRhdGlvbiBpbnRlcmNlcHRvcnMgd2lsbCBub3QgYmUgcnVuLlxuICAgIC8vXG4gICAgLy8gMi4gRHVyaW5nIHZhbGlkYXRpb24sIGFueSBlcnJvciBtdXN0IGZhaWwgdGhlIFVwZGF0ZTsgZHVyaW5nIHRoZSBVcGRhdGVcbiAgICAvLyAgICBpdHNlbGYsIFRlbXBvcmFsIGVycm9ycyBmYWlsIHRoZSBVcGRhdGUgd2hlcmVhcyBvdGhlciBlcnJvcnMgZmFpbCB0aGVcbiAgICAvLyAgICBhY3RpdmF0aW9uLlxuICAgIC8vXG4gICAgLy8gMy4gVGhlIGhhbmRsZXIgbXVzdCBub3Qgc2VlIGFueSBtdXRhdGlvbnMgb2YgdGhlIGFyZ3VtZW50cyBtYWRlIGJ5IHRoZVxuICAgIC8vICAgIHZhbGlkYXRvci5cbiAgICAvL1xuICAgIC8vIDQuIEFueSBlcnJvciB3aGVuIGRlY29kaW5nL2Rlc2VyaWFsaXppbmcgaW5wdXQgbXVzdCBiZSBjYXVnaHQgYW5kIHJlc3VsdFxuICAgIC8vICAgIGluIHJlamVjdGlvbiBvZiB0aGUgVXBkYXRlIGJlZm9yZSBpdCBpcyBhY2NlcHRlZCwgZXZlbiBpZiB0aGVyZSBpcyBub1xuICAgIC8vICAgIHZhbGlkYXRvci5cbiAgICAvL1xuICAgIC8vIDUuIFRoZSBpbml0aWFsIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIChhc3luYykgVXBkYXRlIGhhbmRsZXIgc2hvdWxkXG4gICAgLy8gICAgYmUgZXhlY3V0ZWQgYWZ0ZXIgdGhlIChzeW5jKSB2YWxpZGF0b3IgY29tcGxldGVzIHN1Y2ggdGhhdCB0aGVyZSBpc1xuICAgIC8vICAgIG1pbmltYWwgb3Bwb3J0dW5pdHkgZm9yIGEgZGlmZmVyZW50IGNvbmN1cnJlbnQgdGFzayB0byBiZSBzY2hlZHVsZWRcbiAgICAvLyAgICBiZXR3ZWVuIHRoZW0uXG4gICAgLy9cbiAgICAvLyA2LiBUaGUgc3RhY2sgdHJhY2UgdmlldyBwcm92aWRlZCBpbiB0aGUgVGVtcG9yYWwgVUkgbXVzdCBub3QgYmUgcG9sbHV0ZWRcbiAgICAvLyAgICBieSBwcm9taXNlcyB0aGF0IGRvIG5vdCBkZXJpdmUgZnJvbSB1c2VyIGNvZGUuIFRoaXMgaW1wbGllcyB0aGF0XG4gICAgLy8gICAgYXN5bmMvYXdhaXQgc3ludGF4IG1heSBub3QgYmUgdXNlZC5cbiAgICAvL1xuICAgIC8vIE5vdGUgdGhhdCB0aGVyZSBpcyBhIGRlbGliZXJhdGVseSB1bmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24gYmVsb3cuXG4gICAgLy8gVGhlc2UgYXJlIGNhdWdodCBlbHNld2hlcmUgYW5kIGZhaWwgdGhlIGNvcnJlc3BvbmRpbmcgYWN0aXZhdGlvbi5cbiAgICBsZXQgaW5wdXQ6IFVwZGF0ZUlucHV0O1xuICAgIHRyeSB7XG4gICAgICBpZiAocnVuVmFsaWRhdG9yICYmIHRoaXMudXBkYXRlSGFuZGxlcnMuZ2V0KG5hbWUpPy52YWxpZGF0b3IpIHtcbiAgICAgICAgY29uc3QgdmFsaWRhdGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICAgIHRoaXMuaW50ZXJjZXB0b3JzLmluYm91bmQsXG4gICAgICAgICAgJ3ZhbGlkYXRlVXBkYXRlJyxcbiAgICAgICAgICB0aGlzLnZhbGlkYXRlVXBkYXRlTmV4dEhhbmRsZXIuYmluZCh0aGlzKVxuICAgICAgICApO1xuICAgICAgICB2YWxpZGF0ZShtYWtlSW5wdXQoKSk7XG4gICAgICB9XG4gICAgICBpbnB1dCA9IG1ha2VJbnB1dCgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnModGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCwgJ2hhbmRsZVVwZGF0ZScsIHRoaXMudXBkYXRlTmV4dEhhbmRsZXIuYmluZCh0aGlzKSk7XG4gICAgdGhpcy5hY2NlcHRVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkKTtcbiAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgIGV4ZWN1dGUoaW5wdXQpXG4gICAgICAgIC50aGVuKChyZXN1bHQpID0+IHRoaXMuY29tcGxldGVVcGRhdGUocHJvdG9jb2xJbnN0YW5jZUlkLCByZXN1bHQpKVxuICAgICAgICAuY2F0Y2goKGVycm9yKSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVGVtcG9yYWxGYWlsdXJlKSB7XG4gICAgICAgICAgICB0aGlzLnJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQsIGVycm9yKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICk7XG4gIH1cblxuICBwcm90ZWN0ZWQgYXN5bmMgdXBkYXRlTmV4dEhhbmRsZXIoeyBuYW1lLCBhcmdzIH06IFVwZGF0ZUlucHV0KTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgZW50cnkgPSB0aGlzLnVwZGF0ZUhhbmRsZXJzLmdldChuYW1lKTtcbiAgICBpZiAoIWVudHJ5KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QobmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyByZWdpc3RlcmVkIHVwZGF0ZSBoYW5kbGVyIGZvciB1cGRhdGU6ICR7bmFtZX1gKSk7XG4gICAgfVxuICAgIGNvbnN0IHsgaGFuZGxlciB9ID0gZW50cnk7XG4gICAgcmV0dXJuIGF3YWl0IGhhbmRsZXIoLi4uYXJncyk7XG4gIH1cblxuICBwcm90ZWN0ZWQgdmFsaWRhdGVVcGRhdGVOZXh0SGFuZGxlcih7IG5hbWUsIGFyZ3MgfTogVXBkYXRlSW5wdXQpOiB2b2lkIHtcbiAgICBjb25zdCB7IHZhbGlkYXRvciB9ID0gdGhpcy51cGRhdGVIYW5kbGVycy5nZXQobmFtZSkgPz8ge307XG4gICAgaWYgKHZhbGlkYXRvcikge1xuICAgICAgdmFsaWRhdG9yKC4uLmFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBkaXNwYXRjaEJ1ZmZlcmVkVXBkYXRlcygpOiB2b2lkIHtcbiAgICBjb25zdCBidWZmZXJlZFVwZGF0ZXMgPSB0aGlzLmJ1ZmZlcmVkVXBkYXRlcztcbiAgICB3aGlsZSAoYnVmZmVyZWRVcGRhdGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgZm91bmRJbmRleCA9IGJ1ZmZlcmVkVXBkYXRlcy5maW5kSW5kZXgoKHVwZGF0ZSkgPT4gdGhpcy51cGRhdGVIYW5kbGVycy5oYXModXBkYXRlLm5hbWUgYXMgc3RyaW5nKSk7XG4gICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgLy8gTm8gYnVmZmVyZWQgVXBkYXRlcyBoYXZlIGEgaGFuZGxlciB5ZXQuXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc3QgW3VwZGF0ZV0gPSBidWZmZXJlZFVwZGF0ZXMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgdGhpcy5kb1VwZGF0ZSh1cGRhdGUpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyByZWplY3RCdWZmZXJlZFVwZGF0ZXMoKTogdm9pZCB7XG4gICAgd2hpbGUgKHRoaXMuYnVmZmVyZWRVcGRhdGVzLmxlbmd0aCkge1xuICAgICAgY29uc3QgdXBkYXRlID0gdGhpcy5idWZmZXJlZFVwZGF0ZXMuc2hpZnQoKTtcbiAgICAgIGlmICh1cGRhdGUpIHtcbiAgICAgICAgdGhpcy5yZWplY3RVcGRhdGUoXG4gICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvbiAqL1xuICAgICAgICAgIHVwZGF0ZS5wcm90b2NvbEluc3RhbmNlSWQhLFxuICAgICAgICAgIEFwcGxpY2F0aW9uRmFpbHVyZS5ub25SZXRyeWFibGUoYE5vIHJlZ2lzdGVyZWQgaGFuZGxlciBmb3IgdXBkYXRlOiAke3VwZGF0ZS5uYW1lfWApXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIGFzeW5jIHNpZ25hbFdvcmtmbG93TmV4dEhhbmRsZXIoeyBzaWduYWxOYW1lLCBhcmdzIH06IFNpZ25hbElucHV0KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZm4gPSB0aGlzLnNpZ25hbEhhbmRsZXJzLmdldChzaWduYWxOYW1lKT8uaGFuZGxlcjtcbiAgICBpZiAoZm4pIHtcbiAgICAgIHJldHVybiBhd2FpdCBmbiguLi5hcmdzKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZGVmYXVsdFNpZ25hbEhhbmRsZXIpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKHNpZ25hbE5hbWUsIC4uLmFyZ3MpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoYE5vIHJlZ2lzdGVyZWQgc2lnbmFsIGhhbmRsZXIgZm9yIHNpZ25hbDogJHtzaWduYWxOYW1lfWApO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBzaWduYWxXb3JrZmxvdyhhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVNpZ25hbFdvcmtmbG93KTogdm9pZCB7XG4gICAgY29uc3QgeyBzaWduYWxOYW1lLCBoZWFkZXJzIH0gPSBhY3RpdmF0aW9uO1xuICAgIGlmICghc2lnbmFsTmFtZSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTWlzc2luZyBhY3RpdmF0aW9uIHNpZ25hbE5hbWUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuc2lnbmFsSGFuZGxlcnMuaGFzKHNpZ25hbE5hbWUpICYmICF0aGlzLmRlZmF1bHRTaWduYWxIYW5kbGVyKSB7XG4gICAgICB0aGlzLmJ1ZmZlcmVkU2lnbmFscy5wdXNoKGFjdGl2YXRpb24pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgdGhpcy5pbnRlcmNlcHRvcnMuaW5ib3VuZCxcbiAgICAgICdoYW5kbGVTaWduYWwnLFxuICAgICAgdGhpcy5zaWduYWxXb3JrZmxvd05leHRIYW5kbGVyLmJpbmQodGhpcylcbiAgICApO1xuICAgIGV4ZWN1dGUoe1xuICAgICAgYXJnczogYXJyYXlGcm9tUGF5bG9hZHModGhpcy5wYXlsb2FkQ29udmVydGVyLCBhY3RpdmF0aW9uLmlucHV0KSxcbiAgICAgIHNpZ25hbE5hbWUsXG4gICAgICBoZWFkZXJzOiBoZWFkZXJzID8/IHt9LFxuICAgIH0pLmNhdGNoKHRoaXMuaGFuZGxlV29ya2Zsb3dGYWlsdXJlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcHVibGljIGRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk6IHZvaWQge1xuICAgIGNvbnN0IGJ1ZmZlcmVkU2lnbmFscyA9IHRoaXMuYnVmZmVyZWRTaWduYWxzO1xuICAgIHdoaWxlIChidWZmZXJlZFNpZ25hbHMubGVuZ3RoKSB7XG4gICAgICBpZiAodGhpcy5kZWZhdWx0U2lnbmFsSGFuZGxlcikge1xuICAgICAgICAvLyBXZSBoYXZlIGEgZGVmYXVsdCBzaWduYWwgaGFuZGxlciwgc28gYWxsIHNpZ25hbHMgYXJlIGRpc3BhdGNoYWJsZVxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICB0aGlzLnNpZ25hbFdvcmtmbG93KGJ1ZmZlcmVkU2lnbmFscy5zaGlmdCgpISk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBmb3VuZEluZGV4ID0gYnVmZmVyZWRTaWduYWxzLmZpbmRJbmRleCgoc2lnbmFsKSA9PiB0aGlzLnNpZ25hbEhhbmRsZXJzLmhhcyhzaWduYWwuc2lnbmFsTmFtZSBhcyBzdHJpbmcpKTtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBicmVhaztcbiAgICAgICAgY29uc3QgW3NpZ25hbF0gPSBidWZmZXJlZFNpZ25hbHMuc3BsaWNlKGZvdW5kSW5kZXgsIDEpO1xuICAgICAgICB0aGlzLnNpZ25hbFdvcmtmbG93KHNpZ25hbCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVTaWduYWxFeHRlcm5hbFdvcmtmbG93KGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5JUmVzb2x2ZVNpZ25hbEV4dGVybmFsV29ya2Zsb3cpOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignc2lnbmFsV29ya2Zsb3cnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLmZhaWx1cmUpIHtcbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHJlc29sdmVSZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvdyhcbiAgICBhY3RpdmF0aW9uOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVJlc29sdmVSZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvd1xuICApOiB2b2lkIHtcbiAgICBjb25zdCB7IHJlc29sdmUsIHJlamVjdCB9ID0gdGhpcy5jb25zdW1lQ29tcGxldGlvbignY2FuY2VsV29ya2Zsb3cnLCBnZXRTZXEoYWN0aXZhdGlvbikpO1xuICAgIGlmIChhY3RpdmF0aW9uLmZhaWx1cmUpIHtcbiAgICAgIHJlamVjdCh0aGlzLmZhaWx1cmVUb0Vycm9yKGFjdGl2YXRpb24uZmFpbHVyZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgfVxuICB9XG5cbiAgcHVibGljIHVwZGF0ZVJhbmRvbVNlZWQoYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklVcGRhdGVSYW5kb21TZWVkKTogdm9pZCB7XG4gICAgaWYgKCFhY3RpdmF0aW9uLnJhbmRvbW5lc3NTZWVkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBhY3RpdmF0aW9uIHdpdGggcmFuZG9tbmVzc1NlZWQgYXR0cmlidXRlJyk7XG4gICAgfVxuICAgIHRoaXMucmFuZG9tID0gYWxlYShhY3RpdmF0aW9uLnJhbmRvbW5lc3NTZWVkLnRvQnl0ZXMoKSk7XG4gIH1cblxuICBwdWJsaWMgbm90aWZ5SGFzUGF0Y2goYWN0aXZhdGlvbjogY29yZXNkay53b3JrZmxvd19hY3RpdmF0aW9uLklOb3RpZnlIYXNQYXRjaCk6IHZvaWQge1xuICAgIGlmICghYWN0aXZhdGlvbi5wYXRjaElkKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdOb3RpZnkgaGFzIHBhdGNoIG1pc3NpbmcgcGF0Y2ggbmFtZScpO1xuICAgIH1cbiAgICB0aGlzLmtub3duUHJlc2VudFBhdGNoZXMuYWRkKGFjdGl2YXRpb24ucGF0Y2hJZCk7XG4gIH1cblxuICBwdWJsaWMgcmVtb3ZlRnJvbUNhY2hlKCk6IHZvaWQge1xuICAgIHRocm93IG5ldyBJbGxlZ2FsU3RhdGVFcnJvcigncmVtb3ZlRnJvbUNhY2hlIGFjdGl2YXRpb24gam9iIHNob3VsZCBub3QgcmVhY2ggd29ya2Zsb3cnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUcmFuc2Zvcm1zIGZhaWx1cmVzIGludG8gYSBjb21tYW5kIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICogVXNlZCB0byBoYW5kbGUgYW55IGZhaWx1cmUgZW1pdHRlZCBieSB0aGUgV29ya2Zsb3cuXG4gICAqL1xuICBhc3luYyBoYW5kbGVXb3JrZmxvd0ZhaWx1cmUoZXJyb3I6IHVua25vd24pOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5jYW5jZWxsZWQgJiYgaXNDYW5jZWxsYXRpb24oZXJyb3IpKSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHsgY2FuY2VsV29ya2Zsb3dFeGVjdXRpb246IHt9IH0sIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDb250aW51ZUFzTmV3KSB7XG4gICAgICB0aGlzLnB1c2hDb21tYW5kKHsgY29udGludWVBc05ld1dvcmtmbG93RXhlY3V0aW9uOiBlcnJvci5jb21tYW5kIH0sIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIFRlbXBvcmFsRmFpbHVyZSkpIHtcbiAgICAgICAgLy8gVGhpcyByZXN1bHRzIGluIGFuIHVuaGFuZGxlZCByZWplY3Rpb24gd2hpY2ggd2lsbCBmYWlsIHRoZSBhY3RpdmF0aW9uXG4gICAgICAgIC8vIHByZXZlbnRpbmcgaXQgZnJvbSBjb21wbGV0aW5nLlxuICAgICAgICB0aHJvdyBlcnJvcjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wdXNoQ29tbWFuZChcbiAgICAgICAge1xuICAgICAgICAgIGZhaWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgZmFpbHVyZTogdGhpcy5lcnJvclRvRmFpbHVyZShlcnJvciksXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlUXVlcnkocXVlcnlJZDogc3RyaW5nLCByZXN1bHQ6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHJlc3BvbmRUb1F1ZXJ5OiB7IHF1ZXJ5SWQsIHN1Y2NlZWRlZDogeyByZXNwb25zZTogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpIH0gfSxcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgZmFpbFF1ZXJ5KHF1ZXJ5SWQ6IHN0cmluZywgZXJyb3I6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHJlc3BvbmRUb1F1ZXJ5OiB7XG4gICAgICAgIHF1ZXJ5SWQsXG4gICAgICAgIGZhaWxlZDogdGhpcy5lcnJvclRvRmFpbHVyZShlbnN1cmVUZW1wb3JhbEZhaWx1cmUoZXJyb3IpKSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGFjY2VwdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMucHVzaENvbW1hbmQoeyB1cGRhdGVSZXNwb25zZTogeyBwcm90b2NvbEluc3RhbmNlSWQsIGFjY2VwdGVkOiB7fSB9IH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBjb21wbGV0ZVVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZywgcmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZCh7XG4gICAgICB1cGRhdGVSZXNwb25zZTogeyBwcm90b2NvbEluc3RhbmNlSWQsIGNvbXBsZXRlZDogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpIH0sXG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIHJlamVjdFVwZGF0ZShwcm90b2NvbEluc3RhbmNlSWQ6IHN0cmluZywgZXJyb3I6IHVua25vd24pOiB2b2lkIHtcbiAgICB0aGlzLnB1c2hDb21tYW5kKHtcbiAgICAgIHVwZGF0ZVJlc3BvbnNlOiB7XG4gICAgICAgIHByb3RvY29sSW5zdGFuY2VJZCxcbiAgICAgICAgcmVqZWN0ZWQ6IHRoaXMuZXJyb3JUb0ZhaWx1cmUoZW5zdXJlVGVtcG9yYWxGYWlsdXJlKGVycm9yKSksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG5cbiAgLyoqIENvbnN1bWUgYSBjb21wbGV0aW9uIGlmIGl0IGV4aXN0cyBpbiBXb3JrZmxvdyBzdGF0ZSAqL1xuICBwcml2YXRlIG1heWJlQ29uc3VtZUNvbXBsZXRpb24odHlwZToga2V5b2YgQWN0aXZhdG9yWydjb21wbGV0aW9ucyddLCB0YXNrU2VxOiBudW1iZXIpOiBDb21wbGV0aW9uIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjb21wbGV0aW9uID0gdGhpcy5jb21wbGV0aW9uc1t0eXBlXS5nZXQodGFza1NlcSk7XG4gICAgaWYgKGNvbXBsZXRpb24gIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jb21wbGV0aW9uc1t0eXBlXS5kZWxldGUodGFza1NlcSk7XG4gICAgfVxuICAgIHJldHVybiBjb21wbGV0aW9uO1xuICB9XG5cbiAgLyoqIENvbnN1bWUgYSBjb21wbGV0aW9uIGlmIGl0IGV4aXN0cyBpbiBXb3JrZmxvdyBzdGF0ZSwgdGhyb3dzIGlmIGl0IGRvZXNuJ3QgKi9cbiAgcHJpdmF0ZSBjb25zdW1lQ29tcGxldGlvbih0eXBlOiBrZXlvZiBBY3RpdmF0b3JbJ2NvbXBsZXRpb25zJ10sIHRhc2tTZXE6IG51bWJlcik6IENvbXBsZXRpb24ge1xuICAgIGNvbnN0IGNvbXBsZXRpb24gPSB0aGlzLm1heWJlQ29uc3VtZUNvbXBsZXRpb24odHlwZSwgdGFza1NlcSk7XG4gICAgaWYgKGNvbXBsZXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKGBObyBjb21wbGV0aW9uIGZvciB0YXNrU2VxICR7dGFza1NlcX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBsZXRpb247XG4gIH1cblxuICBwcml2YXRlIGNvbXBsZXRlV29ya2Zsb3cocmVzdWx0OiB1bmtub3duKTogdm9pZCB7XG4gICAgdGhpcy5wdXNoQ29tbWFuZChcbiAgICAgIHtcbiAgICAgICAgY29tcGxldGVXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgIHJlc3VsdDogdGhpcy5wYXlsb2FkQ29udmVydGVyLnRvUGF5bG9hZChyZXN1bHQpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHRydWVcbiAgICApO1xuICB9XG5cbiAgZXJyb3JUb0ZhaWx1cmUoZXJyOiB1bmtub3duKTogUHJvdG9GYWlsdXJlIHtcbiAgICByZXR1cm4gdGhpcy5mYWlsdXJlQ29udmVydGVyLmVycm9yVG9GYWlsdXJlKGVyciwgdGhpcy5wYXlsb2FkQ29udmVydGVyKTtcbiAgfVxuXG4gIGZhaWx1cmVUb0Vycm9yKGZhaWx1cmU6IFByb3RvRmFpbHVyZSk6IEVycm9yIHtcbiAgICByZXR1cm4gdGhpcy5mYWlsdXJlQ29udmVydGVyLmZhaWx1cmVUb0Vycm9yKGZhaWx1cmUsIHRoaXMucGF5bG9hZENvbnZlcnRlcik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0U2VxPFQgZXh0ZW5kcyB7IHNlcT86IG51bWJlciB8IG51bGwgfT4oYWN0aXZhdGlvbjogVCk6IG51bWJlciB7XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRpb24uc2VxO1xuICBpZiAoc2VxID09PSB1bmRlZmluZWQgfHwgc2VxID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgR290IGFjdGl2YXRpb24gd2l0aCBubyBzZXEgYXR0cmlidXRlYCk7XG4gIH1cbiAgcmV0dXJuIHNlcTtcbn1cbiIsImltcG9ydCB7IGNvbXBvc2VJbnRlcmNlcHRvcnMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5pbXBvcnQgeyB0eXBlIFNpbmssIHR5cGUgU2lua3MsIHByb3h5U2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmltcG9ydCB7IGlzQ2FuY2VsbGF0aW9uIH0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHsgV29ya2Zsb3dJbmZvLCBDb250aW51ZUFzTmV3IH0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IGFzc2VydEluV29ya2Zsb3dDb250ZXh0IH0gZnJvbSAnLi9nbG9iYWwtYXR0cmlidXRlcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgV29ya2Zsb3dMb2dnZXIgZXh0ZW5kcyBTaW5rIHtcbiAgdHJhY2UobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgZGVidWcobWVzc2FnZTogc3RyaW5nLCBhdHRycz86IFJlY29yZDxzdHJpbmcsIHVua25vd24+KTogdm9pZDtcbiAgaW5mbyhtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pOiB2b2lkO1xuICB3YXJuKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG4gIGVycm9yKG1lc3NhZ2U6IHN0cmluZywgYXR0cnM/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPik6IHZvaWQ7XG59XG5cbi8qKlxuICogU2luayBpbnRlcmZhY2UgZm9yIGZvcndhcmRpbmcgbG9ncyBmcm9tIHRoZSBXb3JrZmxvdyBzYW5kYm94IHRvIHRoZSBXb3JrZXJcbiAqXG4gKiBAZGVwcmVjYXRlZCBEbyBub3QgdXNlIExvZ2dlclNpbmtzIGRpcmVjdGx5LiBUbyBsb2cgZnJvbSBXb3JrZmxvdyBjb2RlLCB1c2UgdGhlIGBsb2dgIG9iamVjdFxuICogICAgICAgICAgICAgZXhwb3J0ZWQgYnkgdGhlIGBAdGVtcG9yYWxpby93b3JrZmxvd2AgcGFja2FnZS4gVG8gY2FwdHVyZSBsb2cgbWVzc2FnZXMgZW1pdHRlZFxuICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIExvZ2dlclNpbmtzRGVwcmVjYXRlZCBleHRlbmRzIFNpbmtzIHtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIERvIG5vdCB1c2UgTG9nZ2VyU2lua3MgZGlyZWN0bHkuIFRvIGxvZyBmcm9tIFdvcmtmbG93IGNvZGUsIHVzZSB0aGUgYGxvZ2Agb2JqZWN0XG4gICAqICAgICAgICAgICAgIGV4cG9ydGVkIGJ5IHRoZSBgQHRlbXBvcmFsaW8vd29ya2Zsb3dgIHBhY2thZ2UuIFRvIGNhcHR1cmUgbG9nIG1lc3NhZ2VzIGVtaXR0ZWRcbiAgICogICAgICAgICAgICAgYnkgV29ya2Zsb3cgY29kZSwgc2V0IHRoZSB7QGxpbmsgUnVudGltZS5sb2dnZXJ9IHByb3BlcnR5LlxuICAgKi9cbiAgZGVmYXVsdFdvcmtlckxvZ2dlcjogV29ya2Zsb3dMb2dnZXI7XG59XG5cbi8qKlxuICogU2luayBpbnRlcmZhY2UgZm9yIGZvcndhcmRpbmcgbG9ncyBmcm9tIHRoZSBXb3JrZmxvdyBzYW5kYm94IHRvIHRoZSBXb3JrZXJcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBMb2dnZXJTaW5rc0ludGVybmFsIGV4dGVuZHMgU2lua3Mge1xuICBfX3RlbXBvcmFsX2xvZ2dlcjogV29ya2Zsb3dMb2dnZXI7XG59XG5cbmNvbnN0IGxvZ2dlclNpbmsgPSBwcm94eVNpbmtzPExvZ2dlclNpbmtzSW50ZXJuYWw+KCkuX190ZW1wb3JhbF9sb2dnZXI7XG5cbi8qKlxuICogU3ltYm9sIHVzZWQgYnkgdGhlIFNESyBsb2dnZXIgdG8gZXh0cmFjdCBhIHRpbWVzdGFtcCBmcm9tIGxvZyBhdHRyaWJ1dGVzLlxuICogQWxzbyBkZWZpbmVkIGluIGB3b3JrZXIvbG9nZ2VyLnRzYCAtIGludGVudGlvbmFsbHkgbm90IHNoYXJlZC5cbiAqL1xuY29uc3QgTG9nVGltZXN0YW1wID0gU3ltYm9sLmZvcignbG9nX3RpbWVzdGFtcCcpO1xuXG4vKipcbiAqIERlZmF1bHQgd29ya2Zsb3cgbG9nZ2VyLlxuICpcbiAqIFRoaXMgbG9nZ2VyIGlzIHJlcGxheS1hd2FyZSBhbmQgd2lsbCBvbWl0IGxvZyBtZXNzYWdlcyBvbiB3b3JrZmxvdyByZXBsYXkuIE1lc3NhZ2VzIGVtaXR0ZWQgYnkgdGhpcyBsb2dnZXIgYXJlXG4gKiBmdW5uZWxsZWQgdGhyb3VnaCBhIHNpbmsgdGhhdCBmb3J3YXJkcyB0aGVtIHRvIHRoZSBsb2dnZXIgcmVnaXN0ZXJlZCBvbiB7QGxpbmsgUnVudGltZS5sb2dnZXJ9LlxuICpcbiAqIE5vdGljZSB0aGF0IHNpbmNlIHNpbmtzIGFyZSB1c2VkIHRvIHBvd2VyIHRoaXMgbG9nZ2VyLCBhbnkgbG9nIGF0dHJpYnV0ZXMgbXVzdCBiZSB0cmFuc2ZlcmFibGUgdmlhIHRoZVxuICoge0BsaW5rIGh0dHBzOi8vbm9kZWpzLm9yZy9hcGkvd29ya2VyX3RocmVhZHMuaHRtbCN3b3JrZXJfdGhyZWFkc19wb3J0X3Bvc3RtZXNzYWdlX3ZhbHVlX3RyYW5zZmVybGlzdCB8IHBvc3RNZXNzYWdlfVxuICogQVBJLlxuICpcbiAqIE5PVEU6IFNwZWNpZnlpbmcgYSBjdXN0b20gbG9nZ2VyIHRocm91Z2gge0BsaW5rIGRlZmF1bHRTaW5rfSBvciBieSBtYW51YWxseSByZWdpc3RlcmluZyBhIHNpbmsgbmFtZWRcbiAqIGBkZWZhdWx0V29ya2VyTG9nZ2VyYCBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIHtAbGluayBSdW50aW1lLmxvZ2dlcn0gaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvZzogV29ya2Zsb3dMb2dnZXIgPSBPYmplY3QuZnJvbUVudHJpZXMoXG4gIChbJ3RyYWNlJywgJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddIGFzIEFycmF5PGtleW9mIFdvcmtmbG93TG9nZ2VyPikubWFwKChsZXZlbCkgPT4ge1xuICAgIHJldHVybiBbXG4gICAgICBsZXZlbCxcbiAgICAgIChtZXNzYWdlOiBzdHJpbmcsIGF0dHJzPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj4pID0+IHtcbiAgICAgICAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoJ1dvcmtmbG93LmxvZyguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSB3b3JrZmxvdyBjb250ZXh0LicpO1xuICAgICAgICBjb25zdCBnZXRMb2dBdHRyaWJ1dGVzID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnZ2V0TG9nQXR0cmlidXRlcycsIChhKSA9PiBhKTtcbiAgICAgICAgcmV0dXJuIGxvZ2dlclNpbmtbbGV2ZWxdKG1lc3NhZ2UsIHtcbiAgICAgICAgICAvLyBJbmplY3QgdGhlIGNhbGwgdGltZSBpbiBuYW5vc2Vjb25kIHJlc29sdXRpb24gYXMgZXhwZWN0ZWQgYnkgdGhlIHdvcmtlciBsb2dnZXIuXG4gICAgICAgICAgW0xvZ1RpbWVzdGFtcF06IGFjdGl2YXRvci5nZXRUaW1lT2ZEYXkoKSxcbiAgICAgICAgICAuLi5nZXRMb2dBdHRyaWJ1dGVzKHdvcmtmbG93TG9nQXR0cmlidXRlcyhhY3RpdmF0b3IuaW5mbykpLFxuICAgICAgICAgIC4uLmF0dHJzLFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgXTtcbiAgfSlcbikgYXMgYW55O1xuXG5leHBvcnQgZnVuY3Rpb24gZXhlY3V0ZVdpdGhMaWZlY3ljbGVMb2dnaW5nKGZuOiAoKSA9PiBQcm9taXNlPHVua25vd24+KTogUHJvbWlzZTx1bmtub3duPiB7XG4gIGxvZy5kZWJ1ZygnV29ya2Zsb3cgc3RhcnRlZCcpO1xuICBjb25zdCBwID0gZm4oKS50aGVuKFxuICAgIChyZXMpID0+IHtcbiAgICAgIGxvZy5kZWJ1ZygnV29ya2Zsb3cgY29tcGxldGVkJyk7XG4gICAgICByZXR1cm4gcmVzO1xuICAgIH0sXG4gICAgKGVycm9yKSA9PiB7XG4gICAgICAvLyBBdm9pZCB1c2luZyBpbnN0YW5jZW9mIGNoZWNrcyBpbiBjYXNlIHRoZSBtb2R1bGVzIHRoZXkncmUgZGVmaW5lZCBpbiBsb2FkZWQgbW9yZSB0aGFuIG9uY2UsXG4gICAgICAvLyBlLmcuIGJ5IGplc3Qgb3Igd2hlbiBtdWx0aXBsZSB2ZXJzaW9ucyBhcmUgaW5zdGFsbGVkLlxuICAgICAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ29iamVjdCcgJiYgZXJyb3IgIT0gbnVsbCkge1xuICAgICAgICBpZiAoaXNDYW5jZWxsYXRpb24oZXJyb3IpKSB7XG4gICAgICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb21wbGV0ZWQgYXMgY2FuY2VsbGVkJyk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH0gZWxzZSBpZiAoZXJyb3IgaW5zdGFuY2VvZiBDb250aW51ZUFzTmV3KSB7XG4gICAgICAgICAgbG9nLmRlYnVnKCdXb3JrZmxvdyBjb250aW51ZWQgYXMgbmV3Jyk7XG4gICAgICAgICAgdGhyb3cgZXJyb3I7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxvZy53YXJuKCdXb3JrZmxvdyBmYWlsZWQnLCB7IGVycm9yIH0pO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICApO1xuICAvLyBBdm9pZCBzaG93aW5nIHRoaXMgaW50ZXJjZXB0b3IgaW4gc3RhY2sgdHJhY2UgcXVlcnlcbiAgdW50cmFja1Byb21pc2UocCk7XG4gIHJldHVybiBwO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBtYXAgb2YgYXR0cmlidXRlcyB0byBiZSBzZXQgX2J5IGRlZmF1bHRfIG9uIGxvZyBtZXNzYWdlcyBmb3IgYSBnaXZlbiBXb3JrZmxvdy5cbiAqIE5vdGUgdGhhdCB0aGlzIGZ1bmN0aW9uIG1heSBiZSBjYWxsZWQgZnJvbSBvdXRzaWRlIG9mIHRoZSBXb3JrZmxvdyBjb250ZXh0IChlZy4gYnkgdGhlIHdvcmtlciBpdHNlbGYpLlxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dMb2dBdHRyaWJ1dGVzKGluZm86IFdvcmtmbG93SW5mbyk6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lc3BhY2U6IGluZm8ubmFtZXNwYWNlLFxuICAgIHRhc2tRdWV1ZTogaW5mby50YXNrUXVldWUsXG4gICAgd29ya2Zsb3dJZDogaW5mby53b3JrZmxvd0lkLFxuICAgIHJ1bklkOiBpbmZvLnJ1bklkLFxuICAgIHdvcmtmbG93VHlwZTogaW5mby53b3JrZmxvd1R5cGUsXG4gIH07XG59XG4iLCIvLyAuLi9wYWNrYWdlLmpzb24gaXMgb3V0c2lkZSBvZiB0aGUgVFMgcHJvamVjdCByb290RGlyIHdoaWNoIGNhdXNlcyBUUyB0byBjb21wbGFpbiBhYm91dCB0aGlzIGltcG9ydC5cbi8vIFdlIGRvIG5vdCB3YW50IHRvIGNoYW5nZSB0aGUgcm9vdERpciBiZWNhdXNlIGl0IG1lc3NlcyB1cCB0aGUgb3V0cHV0IHN0cnVjdHVyZS5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbi8vIEB0cy1pZ25vcmVcbmltcG9ydCBwa2cgZnJvbSAnLi4vcGFja2FnZS5qc29uJztcblxuZXhwb3J0IGRlZmF1bHQgcGtnIGFzIHsgbmFtZTogc3RyaW5nOyB2ZXJzaW9uOiBzdHJpbmcgfTtcbiIsIi8qKlxuICogVHlwZSBkZWZpbml0aW9ucyBmb3IgdGhlIFdvcmtmbG93IGVuZCBvZiB0aGUgc2lua3MgbWVjaGFuaXNtLlxuICpcbiAqIFNpbmtzIGFyZSBhIG1lY2hhbmlzbSBmb3IgZXhwb3J0aW5nIGRhdGEgZnJvbSB0aGUgV29ya2Zsb3cgaXNvbGF0ZSB0byB0aGVcbiAqIE5vZGUuanMgZW52aXJvbm1lbnQsIHRoZXkgYXJlIG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBXb3JrZmxvdyBoYXMgbm8gd2F5IHRvXG4gKiBjb21tdW5pY2F0ZSB3aXRoIHRoZSBvdXRzaWRlIFdvcmxkLlxuICpcbiAqIFNpbmtzIGFyZSB0eXBpY2FsbHkgdXNlZCBmb3IgZXhwb3J0aW5nIGxvZ3MsIG1ldHJpY3MgYW5kIHRyYWNlcyBvdXQgZnJvbSB0aGVcbiAqIFdvcmtmbG93LlxuICpcbiAqIFNpbmsgZnVuY3Rpb25zIG1heSBub3QgcmV0dXJuIHZhbHVlcyB0byB0aGUgV29ya2Zsb3cgaW4gb3JkZXIgdG8gcHJldmVudFxuICogYnJlYWtpbmcgZGV0ZXJtaW5pc20uXG4gKlxuICogQG1vZHVsZVxuICovXG5cbmltcG9ydCB7IFdvcmtmbG93SW5mbyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuXG4vKipcbiAqIEFueSBmdW5jdGlvbiBzaWduYXR1cmUgY2FuIGJlIHVzZWQgZm9yIFNpbmsgZnVuY3Rpb25zIGFzIGxvbmcgYXMgdGhlIHJldHVybiB0eXBlIGlzIGB2b2lkYC5cbiAqXG4gKiBXaGVuIGNhbGxpbmcgYSBTaW5rIGZ1bmN0aW9uLCBhcmd1bWVudHMgYXJlIGNvcGllZCBmcm9tIHRoZSBXb3JrZmxvdyBpc29sYXRlIHRvIHRoZSBOb2RlLmpzIGVudmlyb25tZW50IHVzaW5nXG4gKiB7QGxpbmsgaHR0cHM6Ly9ub2RlanMub3JnL2FwaS93b3JrZXJfdGhyZWFkcy5odG1sI3dvcmtlcl90aHJlYWRzX3BvcnRfcG9zdG1lc3NhZ2VfdmFsdWVfdHJhbnNmZXJsaXN0IHwgcG9zdE1lc3NhZ2V9LlxuXG4gKiBUaGlzIGNvbnN0cmFpbnMgdGhlIGFyZ3VtZW50IHR5cGVzIHRvIHByaW1pdGl2ZXMgKGV4Y2x1ZGluZyBTeW1ib2xzKS5cbiAqL1xuZXhwb3J0IHR5cGUgU2lua0Z1bmN0aW9uID0gKC4uLmFyZ3M6IGFueVtdKSA9PiB2b2lkO1xuXG4vKiogQSBtYXBwaW5nIG9mIG5hbWUgdG8gZnVuY3Rpb24sIGRlZmluZXMgYSBzaW5nbGUgc2luayAoZS5nLiBsb2dnZXIpICovXG5leHBvcnQgdHlwZSBTaW5rID0gUmVjb3JkPHN0cmluZywgU2lua0Z1bmN0aW9uPjtcbi8qKlxuICogV29ya2Zsb3cgU2luayBhcmUgYSBtYXBwaW5nIG9mIG5hbWUgdG8ge0BsaW5rIFNpbmt9XG4gKi9cbmV4cG9ydCB0eXBlIFNpbmtzID0gUmVjb3JkPHN0cmluZywgU2luaz47XG5cbi8qKlxuICogQ2FsbCBpbmZvcm1hdGlvbiBmb3IgYSBTaW5rXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2lua0NhbGwge1xuICBpZmFjZU5hbWU6IHN0cmluZztcbiAgZm5OYW1lOiBzdHJpbmc7XG4gIGFyZ3M6IGFueVtdO1xuICB3b3JrZmxvd0luZm86IFdvcmtmbG93SW5mbztcbn1cblxuLyoqXG4gKiBHZXQgYSByZWZlcmVuY2UgdG8gU2lua3MgZm9yIGV4cG9ydGluZyBkYXRhIG91dCBvZiB0aGUgV29ya2Zsb3cuXG4gKlxuICogVGhlc2UgU2lua3MgKiptdXN0KiogYmUgcmVnaXN0ZXJlZCB3aXRoIHRoZSBXb3JrZXIgaW4gb3JkZXIgZm9yIHRoaXNcbiAqIG1lY2hhbmlzbSB0byB3b3JrLlxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlTaW5rcywgU2lua3MgfSBmcm9tICdAdGVtcG9yYWxpby93b3JrZmxvdyc7XG4gKlxuICogaW50ZXJmYWNlIE15U2lua3MgZXh0ZW5kcyBTaW5rcyB7XG4gKiAgIGxvZ2dlcjoge1xuICogICAgIGluZm8obWVzc2FnZTogc3RyaW5nKTogdm9pZDtcbiAqICAgICBlcnJvcihtZXNzYWdlOiBzdHJpbmcpOiB2b2lkO1xuICogICB9O1xuICogfVxuICpcbiAqIGNvbnN0IHsgbG9nZ2VyIH0gPSBwcm94eVNpbmtzPE15RGVwZW5kZW5jaWVzPigpO1xuICogbG9nZ2VyLmluZm8oJ3NldHRpbmcgdXAnKTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gbXlXb3JrZmxvdygpIHtcbiAqICAgcmV0dXJuIHtcbiAqICAgICBhc3luYyBleGVjdXRlKCkge1xuICogICAgICAgbG9nZ2VyLmluZm8oXCJoZXkgaG9cIik7XG4gKiAgICAgICBsb2dnZXIuZXJyb3IoXCJsZXRzIGdvXCIpO1xuICogICAgIH1cbiAqICAgfTtcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlTaW5rczxUIGV4dGVuZHMgU2lua3M+KCk6IFQge1xuICByZXR1cm4gbmV3IFByb3h5KFxuICAgIHt9LFxuICAgIHtcbiAgICAgIGdldChfLCBpZmFjZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm94eShcbiAgICAgICAgICB7fSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBnZXQoXywgZm5OYW1lKSB7XG4gICAgICAgICAgICAgIHJldHVybiAoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAgICAgICAgICAgICAgICdQcm94aWVkIHNpbmtzIGZ1bmN0aW9ucyBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgYWN0aXZhdG9yLnNpbmtDYWxscy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgIGlmYWNlTmFtZTogaWZhY2VOYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIGZuTmFtZTogZm5OYW1lIGFzIHN0cmluZyxcbiAgICAgICAgICAgICAgICAgIC8vIFNpbmsgZnVuY3Rpb24gZG9lc24ndCBnZXQgY2FsbGVkIGltbWVkaWF0ZWx5LiBNYWtlIGEgY2xvbmUgb2YgdGhlIHNpbmsncyBhcmdzLCBzbyB0aGF0IGZ1cnRoZXIgbXV0YXRpb25zXG4gICAgICAgICAgICAgICAgICAvLyB0byB0aGVzZSBvYmplY3RzIGRvbid0IGNvcnJ1cHQgdGhlIGFyZ3MgdGhhdCB0aGUgc2luayBmdW5jdGlvbiB3aWxsIHJlY2VpdmUuIE9ubHkgYXZhaWxhYmxlIGZyb20gbm9kZSAxNy5cbiAgICAgICAgICAgICAgICAgIGFyZ3M6IChnbG9iYWxUaGlzIGFzIGFueSkuc3RydWN0dXJlZENsb25lID8gKGdsb2JhbFRoaXMgYXMgYW55KS5zdHJ1Y3R1cmVkQ2xvbmUoYXJncykgOiBhcmdzLFxuICAgICAgICAgICAgICAgICAgLy8gYWN0aXZhdG9yLmluZm8gaXMgaW50ZXJuYWxseSBjb3B5LW9uLXdyaXRlLiBUaGlzIGVuc3VyZSB0aGF0IGFueSBmdXJ0aGVyIG11dGF0aW9uc1xuICAgICAgICAgICAgICAgICAgLy8gdG8gdGhlIHdvcmtmbG93IHN0YXRlIGluIHRoZSBjb250ZXh0IG9mIHRoZSBwcmVzZW50IGFjdGl2YXRpb24gd2lsbCBub3QgY29ycnVwdCB0aGVcbiAgICAgICAgICAgICAgICAgIC8vIHdvcmtmbG93SW5mbyBzdGF0ZSB0aGF0IGdldHMgcGFzc2VkIHdoZW4gdGhlIHNpbmsgZnVuY3Rpb24gYWN0dWFsbHkgZ2V0cyBjYWxsZWQuXG4gICAgICAgICAgICAgICAgICB3b3JrZmxvd0luZm86IGFjdGl2YXRvci5pbmZvLFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG4iLCJpbXBvcnQgeyBtYXliZUdldEFjdGl2YXRvclVudHlwZWQgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB0eXBlIHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRvIHJlbW92ZSBhIHByb21pc2UgZnJvbSBiZWluZyB0cmFja2VkIGZvciBzdGFjayB0cmFjZSBxdWVyeSBwdXJwb3Nlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdW50cmFja1Byb21pc2UocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPik6IHZvaWQge1xuICBjb25zdCBzdG9yZSA9IChtYXliZUdldEFjdGl2YXRvclVudHlwZWQoKSBhcyBhbnkpPy5wcm9taXNlU3RhY2tTdG9yZSBhcyBQcm9taXNlU3RhY2tTdG9yZSB8IHVuZGVmaW5lZDtcbiAgaWYgKCFzdG9yZSkgcmV0dXJuO1xuICBzdG9yZS5jaGlsZFRvUGFyZW50LmRlbGV0ZShwcm9taXNlKTtcbiAgc3RvcmUucHJvbWlzZVRvU3RhY2suZGVsZXRlKHByb21pc2UpO1xufVxuIiwiaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUgfSBmcm9tICcuL2NhbmNlbGxhdGlvbi1zY29wZSc7XG5pbXBvcnQgeyB1bnRyYWNrUHJvbWlzZSB9IGZyb20gJy4vc3RhY2staGVscGVycyc7XG5cbi8qKlxuICogQSBgUHJvbWlzZUxpa2VgIGhlbHBlciB3aGljaCBleHBvc2VzIGl0cyBgcmVzb2x2ZWAgYW5kIGByZWplY3RgIG1ldGhvZHMuXG4gKlxuICogVHJpZ2dlciBpcyBDYW5jZWxsYXRpb25TY29wZS1hd2FyZTogaXQgaXMgbGlua2VkIHRvIHRoZSBjdXJyZW50IHNjb3BlIG9uXG4gKiBjb25zdHJ1Y3Rpb24gYW5kIHRocm93cyB3aGVuIHRoYXQgc2NvcGUgaXMgY2FuY2VsbGVkLlxuICpcbiAqIFVzZWZ1bCBmb3IgZS5nLiB3YWl0aW5nIGZvciB1bmJsb2NraW5nIGEgV29ya2Zsb3cgZnJvbSBhIFNpZ25hbC5cbiAqXG4gKiBAZXhhbXBsZVxuICogPCEtLVNOSVBTVEFSVCB0eXBlc2NyaXB0LXRyaWdnZXItd29ya2Zsb3ctLT5cbiAqIDwhLS1TTklQRU5ELS0+XG4gKi9cbmV4cG9ydCBjbGFzcyBUcmlnZ2VyPFQ+IGltcGxlbWVudHMgUHJvbWlzZUxpa2U8VD4ge1xuICAvLyBUeXBlc2NyaXB0IGRvZXMgbm90IHJlYWxpemUgdGhhdCB0aGUgcHJvbWlzZSBleGVjdXRvciBpcyBydW4gc3luY2hyb25vdXNseSBpbiB0aGUgY29uc3RydWN0b3JcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZXNvbHZlOiAodmFsdWU6IFQgfCBQcm9taXNlTGlrZTxUPikgPT4gdm9pZDtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAvLyBAdHMtaWdub3JlXG4gIHB1YmxpYyByZWFkb25seSByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQ7XG4gIHByb3RlY3RlZCByZWFkb25seSBwcm9taXNlOiBQcm9taXNlPFQ+O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMucHJvbWlzZSA9IG5ldyBQcm9taXNlPFQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQgfHwgc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgfVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcbiAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuICAgIC8vIEF2b2lkIHVuaGFuZGxlZCByZWplY3Rpb25zXG4gICAgdW50cmFja1Byb21pc2UodGhpcy5wcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICB9XG5cbiAgdGhlbjxUUmVzdWx0MSA9IFQsIFRSZXN1bHQyID0gbmV2ZXI+KFxuICAgIG9uZnVsZmlsbGVkPzogKCh2YWx1ZTogVCkgPT4gVFJlc3VsdDEgfCBQcm9taXNlTGlrZTxUUmVzdWx0MT4pIHwgdW5kZWZpbmVkIHwgbnVsbCxcbiAgICBvbnJlamVjdGVkPzogKChyZWFzb246IGFueSkgPT4gVFJlc3VsdDIgfCBQcm9taXNlTGlrZTxUUmVzdWx0Mj4pIHwgdW5kZWZpbmVkIHwgbnVsbFxuICApOiBQcm9taXNlTGlrZTxUUmVzdWx0MSB8IFRSZXN1bHQyPiB7XG4gICAgcmV0dXJuIHRoaXMucHJvbWlzZS50aGVuKG9uZnVsZmlsbGVkLCBvbnJlamVjdGVkKTtcbiAgfVxufVxuIiwiLyoqXG4gKiBFeHBvcnRlZCBmdW5jdGlvbnMgZm9yIHRoZSBXb3JrZXIgdG8gaW50ZXJhY3Qgd2l0aCB0aGUgV29ya2Zsb3cgaXNvbGF0ZVxuICpcbiAqIEBtb2R1bGVcbiAqL1xuaW1wb3J0IHsgSWxsZWdhbFN0YXRlRXJyb3IgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24nO1xuaW1wb3J0IHsgbXNUb1RzLCB0c1RvTXMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IGNvcmVzZGsgfSBmcm9tICdAdGVtcG9yYWxpby9wcm90byc7XG5pbXBvcnQgeyBkaXNhYmxlU3RvcmFnZSB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgfSBmcm9tICcuL2ludGVyY2VwdG9ycyc7XG5pbXBvcnQgeyBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBBY3RpdmF0b3IgfSBmcm9tICcuL2ludGVybmFscyc7XG5pbXBvcnQgeyBzZXRBY3RpdmF0b3JVbnR5cGVkLCBnZXRBY3RpdmF0b3IgfSBmcm9tICcuL2dsb2JhbC1hdHRyaWJ1dGVzJztcbmltcG9ydCB7IHR5cGUgU2lua0NhbGwgfSBmcm9tICcuL3NpbmtzJztcblxuLy8gRXhwb3J0IHRoZSB0eXBlIGZvciB1c2Ugb24gdGhlIFwid29ya2VyXCIgc2lkZVxuZXhwb3J0IHsgUHJvbWlzZVN0YWNrU3RvcmUgfSBmcm9tICcuL2ludGVybmFscyc7XG5cbmNvbnN0IGdsb2JhbCA9IGdsb2JhbFRoaXMgYXMgYW55O1xuY29uc3QgT3JpZ2luYWxEYXRlID0gZ2xvYmFsVGhpcy5EYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gb3ZlcnJpZGVHbG9iYWxzKCk6IHZvaWQge1xuICAvLyBNb2NrIGFueSB3ZWFrIHJlZmVyZW5jZSBiZWNhdXNlIEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljIGFuZCB0aGUgZWZmZWN0IGlzIG9ic2VydmFibGUgZnJvbSB0aGUgV29ya2Zsb3cuXG4gIC8vIFdvcmtmbG93IGRldmVsb3BlciB3aWxsIGdldCBhIG1lYW5pbmdmdWwgZXhjZXB0aW9uIGlmIHRoZXkgdHJ5IHRvIHVzZSB0aGVzZS5cbiAgZ2xvYmFsLldlYWtSZWYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhyb3cgbmV3IERldGVybWluaXNtVmlvbGF0aW9uRXJyb3IoJ1dlYWtSZWYgY2Fubm90IGJlIHVzZWQgaW4gV29ya2Zsb3dzIGJlY2F1c2UgdjggR0MgaXMgbm9uLWRldGVybWluaXN0aWMnKTtcbiAgfTtcbiAgZ2xvYmFsLkZpbmFsaXphdGlvblJlZ2lzdHJ5ID0gZnVuY3Rpb24gKCkge1xuICAgIHRocm93IG5ldyBEZXRlcm1pbmlzbVZpb2xhdGlvbkVycm9yKFxuICAgICAgJ0ZpbmFsaXphdGlvblJlZ2lzdHJ5IGNhbm5vdCBiZSB1c2VkIGluIFdvcmtmbG93cyBiZWNhdXNlIHY4IEdDIGlzIG5vbi1kZXRlcm1pbmlzdGljJ1xuICAgICk7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUgPSBmdW5jdGlvbiAoLi4uYXJnczogdW5rbm93bltdKSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIG5ldyAoT3JpZ2luYWxEYXRlIGFzIGFueSkoLi4uYXJncyk7XG4gICAgfVxuICAgIHJldHVybiBuZXcgT3JpZ2luYWxEYXRlKGdldEFjdGl2YXRvcigpLm5vdyk7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUubm93ID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBnZXRBY3RpdmF0b3IoKS5ub3c7XG4gIH07XG5cbiAgZ2xvYmFsLkRhdGUucGFyc2UgPSBPcmlnaW5hbERhdGUucGFyc2UuYmluZChPcmlnaW5hbERhdGUpO1xuICBnbG9iYWwuRGF0ZS5VVEMgPSBPcmlnaW5hbERhdGUuVVRDLmJpbmQoT3JpZ2luYWxEYXRlKTtcblxuICBnbG9iYWwuRGF0ZS5wcm90b3R5cGUgPSBPcmlnaW5hbERhdGUucHJvdG90eXBlO1xuXG4gIC8qKlxuICAgKiBAcGFyYW0gbXMgc2xlZXAgZHVyYXRpb24gLSAgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcy4gSWYgZ2l2ZW4gYSBuZWdhdGl2ZSBudW1iZXIsIHZhbHVlIHdpbGwgYmUgc2V0IHRvIDEuXG4gICAqL1xuICBnbG9iYWwuc2V0VGltZW91dCA9IGZ1bmN0aW9uIChjYjogKC4uLmFyZ3M6IGFueVtdKSA9PiBhbnksIG1zOiBudW1iZXIsIC4uLmFyZ3M6IGFueVtdKTogbnVtYmVyIHtcbiAgICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgICBtcyA9IE1hdGgubWF4KDEsIG1zKTtcbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcbiAgICAvLyBDcmVhdGUgYSBQcm9taXNlIGZvciBBc3luY0xvY2FsU3RvcmFnZSB0byBiZSBhYmxlIHRvIHRyYWNrIHRoaXMgY29tcGxldGlvbiB1c2luZyBwcm9taXNlIGhvb2tzLlxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5zZXQoc2VxLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgICBzZXEsXG4gICAgICAgICAgc3RhcnRUb0ZpcmVUaW1lb3V0OiBtc1RvVHMobXMpLFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSkudGhlbihcbiAgICAgICgpID0+IGNiKC4uLmFyZ3MpLFxuICAgICAgKCkgPT4gdW5kZWZpbmVkIC8qIGlnbm9yZSBjYW5jZWxsYXRpb24gKi9cbiAgICApO1xuICAgIHJldHVybiBzZXE7XG4gIH07XG5cbiAgZ2xvYmFsLmNsZWFyVGltZW91dCA9IGZ1bmN0aW9uIChoYW5kbGU6IG51bWJlcik6IHZvaWQge1xuICAgIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICAgIGFjdGl2YXRvci5uZXh0U2Vxcy50aW1lcisrO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaGFuZGxlKTtcbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgc2VxOiBoYW5kbGUsXG4gICAgICB9LFxuICAgIH0pO1xuICB9O1xuXG4gIC8vIGFjdGl2YXRvci5yYW5kb20gaXMgbXV0YWJsZSwgZG9uJ3QgaGFyZGNvZGUgaXRzIHJlZmVyZW5jZVxuICBNYXRoLnJhbmRvbSA9ICgpID0+IGdldEFjdGl2YXRvcigpLnJhbmRvbSgpO1xufVxuXG4vKipcbiAqIEluaXRpYWxpemUgdGhlIGlzb2xhdGUgcnVudGltZS5cbiAqXG4gKiBTZXRzIHJlcXVpcmVkIGludGVybmFsIHN0YXRlIGFuZCBpbnN0YW50aWF0ZXMgdGhlIHdvcmtmbG93IGFuZCBpbnRlcmNlcHRvcnMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbml0UnVudGltZShvcHRpb25zOiBXb3JrZmxvd0NyZWF0ZU9wdGlvbnNJbnRlcm5hbCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBuZXcgQWN0aXZhdG9yKHtcbiAgICAuLi5vcHRpb25zLFxuICAgIGluZm86IGZpeFByb3RvdHlwZXMoe1xuICAgICAgLi4ub3B0aW9ucy5pbmZvLFxuICAgICAgdW5zYWZlOiB7IC4uLm9wdGlvbnMuaW5mby51bnNhZmUsIG5vdzogT3JpZ2luYWxEYXRlLm5vdyB9LFxuICAgIH0pLFxuICB9KTtcbiAgLy8gVGhlcmUncyBvbiBhY3RpdmF0b3IgcGVyIHdvcmtmbG93IGluc3RhbmNlLCBzZXQgaXQgZ2xvYmFsbHkgb24gdGhlIGNvbnRleHQuXG4gIC8vIFdlIGRvIHRoaXMgYmVmb3JlIGltcG9ydGluZyBhbnkgdXNlciBjb2RlIHNvIHVzZXIgY29kZSBjYW4gc3RhdGljYWxseSByZWZlcmVuY2UgQHRlbXBvcmFsaW8vd29ya2Zsb3cgZnVuY3Rpb25zXG4gIC8vIGFzIHdlbGwgYXMgRGF0ZSBhbmQgTWF0aC5yYW5kb20uXG4gIHNldEFjdGl2YXRvclVudHlwZWQoYWN0aXZhdG9yKTtcblxuICAvLyB3ZWJwYWNrIGFsaWFzIHRvIHBheWxvYWRDb252ZXJ0ZXJQYXRoXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gIGNvbnN0IGN1c3RvbVBheWxvYWRDb252ZXJ0ZXIgPSByZXF1aXJlKCdfX3RlbXBvcmFsX2N1c3RvbV9wYXlsb2FkX2NvbnZlcnRlcicpLnBheWxvYWRDb252ZXJ0ZXI7XG4gIC8vIFRoZSBgcGF5bG9hZENvbnZlcnRlcmAgZXhwb3J0IGlzIHZhbGlkYXRlZCBpbiB0aGUgV29ya2VyXG4gIGlmIChjdXN0b21QYXlsb2FkQ29udmVydGVyICE9IG51bGwpIHtcbiAgICBhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciA9IGN1c3RvbVBheWxvYWRDb252ZXJ0ZXI7XG4gIH1cbiAgLy8gd2VicGFjayBhbGlhcyB0byBmYWlsdXJlQ29udmVydGVyUGF0aFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICBjb25zdCBjdXN0b21GYWlsdXJlQ29udmVydGVyID0gcmVxdWlyZSgnX190ZW1wb3JhbF9jdXN0b21fZmFpbHVyZV9jb252ZXJ0ZXInKS5mYWlsdXJlQ29udmVydGVyO1xuICAvLyBUaGUgYGZhaWx1cmVDb252ZXJ0ZXJgIGV4cG9ydCBpcyB2YWxpZGF0ZWQgaW4gdGhlIFdvcmtlclxuICBpZiAoY3VzdG9tRmFpbHVyZUNvbnZlcnRlciAhPSBudWxsKSB7XG4gICAgYWN0aXZhdG9yLmZhaWx1cmVDb252ZXJ0ZXIgPSBjdXN0b21GYWlsdXJlQ29udmVydGVyO1xuICB9XG5cbiAgY29uc3QgeyBpbXBvcnRXb3JrZmxvd3MsIGltcG9ydEludGVyY2VwdG9ycyB9ID0gZ2xvYmFsLl9fVEVNUE9SQUxfXztcbiAgaWYgKGltcG9ydFdvcmtmbG93cyA9PT0gdW5kZWZpbmVkIHx8IGltcG9ydEludGVyY2VwdG9ycyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IElsbGVnYWxTdGF0ZUVycm9yKCdXb3JrZmxvdyBidW5kbGUgZGlkIG5vdCByZWdpc3RlciBpbXBvcnQgaG9va3MnKTtcbiAgfVxuXG4gIGNvbnN0IGludGVyY2VwdG9ycyA9IGltcG9ydEludGVyY2VwdG9ycygpO1xuICBmb3IgKGNvbnN0IG1vZCBvZiBpbnRlcmNlcHRvcnMpIHtcbiAgICBjb25zdCBmYWN0b3J5OiBXb3JrZmxvd0ludGVyY2VwdG9yc0ZhY3RvcnkgPSBtb2QuaW50ZXJjZXB0b3JzO1xuICAgIGlmIChmYWN0b3J5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgZmFjdG9yeSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB3b3JrZmxvd3MgaW50ZXJjZXB0b3JzOiBleHBlY3RlZCBhIGZ1bmN0aW9uLCBidXQgZ290OiAnJHtmYWN0b3J5fSdgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGZhY3RvcnkoKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW5ib3VuZC5wdXNoKC4uLihpbnRlcmNlcHRvcnMuaW5ib3VuZCA/PyBbXSkpO1xuICAgICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZC5wdXNoKC4uLihpbnRlcmNlcHRvcnMub3V0Ym91bmQgPz8gW10pKTtcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLnB1c2goLi4uKGludGVyY2VwdG9ycy5pbnRlcm5hbHMgPz8gW10pKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBtb2QgPSBpbXBvcnRXb3JrZmxvd3MoKTtcbiAgY29uc3Qgd29ya2Zsb3dGbiA9IG1vZFthY3RpdmF0b3IuaW5mby53b3JrZmxvd1R5cGVdO1xuICBjb25zdCBkZWZhdWx0V29ya2Zsb3dGbiA9IG1vZFsnZGVmYXVsdCddO1xuXG4gIGlmICh0eXBlb2Ygd29ya2Zsb3dGbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGFjdGl2YXRvci53b3JrZmxvdyA9IHdvcmtmbG93Rm47XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmF1bHRXb3JrZmxvd0ZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYWN0aXZhdG9yLndvcmtmbG93ID0gZGVmYXVsdFdvcmtmbG93Rm47XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGV0YWlscyA9XG4gICAgICB3b3JrZmxvd0ZuID09PSB1bmRlZmluZWRcbiAgICAgICAgPyAnbm8gc3VjaCBmdW5jdGlvbiBpcyBleHBvcnRlZCBieSB0aGUgd29ya2Zsb3cgYnVuZGxlJ1xuICAgICAgICA6IGBleHBlY3RlZCBhIGZ1bmN0aW9uLCBidXQgZ290OiAnJHt0eXBlb2Ygd29ya2Zsb3dGbn0nYDtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBGYWlsZWQgdG8gaW5pdGlhbGl6ZSB3b3JrZmxvdyBvZiB0eXBlICcke2FjdGl2YXRvci5pbmZvLndvcmtmbG93VHlwZX0nOiAke2RldGFpbHN9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBPYmplY3RzIHRyYW5zZmVyZWQgdG8gdGhlIFZNIGZyb20gb3V0c2lkZSBoYXZlIHByb3RvdHlwZXMgYmVsb25naW5nIHRvIHRoZVxuICogb3V0ZXIgY29udGV4dCwgd2hpY2ggbWVhbnMgdGhhdCBpbnN0YW5jZW9mIHdvbid0IHdvcmsgaW5zaWRlIHRoZSBWTS4gVGhpc1xuICogZnVuY3Rpb24gcmVjdXJzaXZlbHkgd2Fsa3Mgb3ZlciB0aGUgY29udGVudCBvZiBhbiBvYmplY3QsIGFuZCByZWNyZWF0ZSBzb21lXG4gKiBvZiB0aGVzZSBvYmplY3RzIChub3RhYmx5IEFycmF5LCBEYXRlIGFuZCBPYmplY3RzKS5cbiAqL1xuZnVuY3Rpb24gZml4UHJvdG90eXBlczxYPihvYmo6IFgpOiBYIHtcbiAgaWYgKG9iaiAhPSBudWxsICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnKSB7XG4gICAgc3dpdGNoIChPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKT8uY29uc3RydWN0b3I/Lm5hbWUpIHtcbiAgICAgIGNhc2UgJ0FycmF5JzpcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oKG9iaiBhcyBBcnJheTx1bmtub3duPikubWFwKGZpeFByb3RvdHlwZXMpKSBhcyBYO1xuICAgICAgY2FzZSAnRGF0ZSc6XG4gICAgICAgIHJldHVybiBuZXcgRGF0ZShvYmogYXMgdW5rbm93biBhcyBEYXRlKSBhcyBYO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyhPYmplY3QuZW50cmllcyhvYmopLm1hcCgoW2ssIHZdKTogW3N0cmluZywgYW55XSA9PiBbaywgZml4UHJvdG90eXBlcyh2KV0pKSBhcyBYO1xuICAgIH1cbiAgfSBlbHNlIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogUnVuIGEgY2h1bmsgb2YgYWN0aXZhdGlvbiBqb2JzXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGpvYiB3YXMgcHJvY2Vzc2VkIG9yIGlnbm9yZWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKGFjdGl2YXRpb246IGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5Xb3JrZmxvd0FjdGl2YXRpb24sIGJhdGNoSW5kZXg6IG51bWJlcik6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgY29uc3QgaW50ZXJjZXB0ID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLmludGVybmFscywgJ2FjdGl2YXRlJywgKHsgYWN0aXZhdGlvbiwgYmF0Y2hJbmRleCB9KSA9PiB7XG4gICAgaWYgKGJhdGNoSW5kZXggPT09IDApIHtcbiAgICAgIGlmICghYWN0aXZhdGlvbi5qb2JzKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0dvdCBhY3RpdmF0aW9uIHdpdGggbm8gam9icycpO1xuICAgICAgfVxuICAgICAgaWYgKGFjdGl2YXRpb24udGltZXN0YW1wICE9IG51bGwpIHtcbiAgICAgICAgLy8gdGltZXN0YW1wIHdpbGwgbm90IGJlIHVwZGF0ZWQgZm9yIGFjdGl2YXRpb24gdGhhdCBjb250YWluIG9ubHkgcXVlcmllc1xuICAgICAgICBhY3RpdmF0b3Iubm93ID0gdHNUb01zKGFjdGl2YXRpb24udGltZXN0YW1wKTtcbiAgICAgIH1cblxuICAgICAgLy8gVGhlIFJ1c3QgQ29yZSBlbnN1cmVzIHRoYXQgdGhlc2UgYWN0aXZhdGlvbiBmaWVsZHMgYXJlIG5vdCBudWxsXG4gICAgICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvKSA9PiAoe1xuICAgICAgICAuLi5pbmZvLFxuICAgICAgICBoaXN0b3J5TGVuZ3RoOiBhY3RpdmF0aW9uLmhpc3RvcnlMZW5ndGggYXMgbnVtYmVyLFxuICAgICAgICAvLyBFeGFjdCB0cnVuY2F0aW9uIGZvciBtdWx0aS1wZXRhYnl0ZSBoaXN0b3JpZXNcbiAgICAgICAgLy8gaGlzdG9yeVNpemUgPT09IDAgbWVhbnMgV0ZUIHdhcyBnZW5lcmF0ZWQgYnkgcHJlLTEuMjAuMCBzZXJ2ZXIsIGFuZCB0aGUgaGlzdG9yeSBzaXplIGlzIHVua25vd25cbiAgICAgICAgaGlzdG9yeVNpemU6IGFjdGl2YXRpb24uaGlzdG9yeVNpemVCeXRlcz8udG9OdW1iZXIoKSB8fCAwLFxuICAgICAgICBjb250aW51ZUFzTmV3U3VnZ2VzdGVkOiBhY3RpdmF0aW9uLmNvbnRpbnVlQXNOZXdTdWdnZXN0ZWQgPz8gZmFsc2UsXG4gICAgICAgIGN1cnJlbnRCdWlsZElkOiBhY3RpdmF0aW9uLmJ1aWxkSWRGb3JDdXJyZW50VGFzayA/PyB1bmRlZmluZWQsXG4gICAgICAgIHVuc2FmZToge1xuICAgICAgICAgIC4uLmluZm8udW5zYWZlLFxuICAgICAgICAgIGlzUmVwbGF5aW5nOiBhY3RpdmF0aW9uLmlzUmVwbGF5aW5nID8/IGZhbHNlLFxuICAgICAgICB9LFxuICAgICAgfSkpO1xuICAgIH1cblxuICAgIC8vIENhc3QgZnJvbSB0aGUgaW50ZXJmYWNlIHRvIHRoZSBjbGFzcyB3aGljaCBoYXMgdGhlIGB2YXJpYW50YCBhdHRyaWJ1dGUuXG4gICAgLy8gVGhpcyBpcyBzYWZlIGJlY2F1c2Ugd2Uga25vdyB0aGF0IGFjdGl2YXRpb24gaXMgYSBwcm90byBjbGFzcy5cbiAgICBjb25zdCBqb2JzID0gYWN0aXZhdGlvbi5qb2JzIGFzIGNvcmVzZGsud29ya2Zsb3dfYWN0aXZhdGlvbi5Xb3JrZmxvd0FjdGl2YXRpb25Kb2JbXTtcblxuICAgIGZvciAoY29uc3Qgam9iIG9mIGpvYnMpIHtcbiAgICAgIGlmIChqb2IudmFyaWFudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGpvYi52YXJpYW50IHRvIGJlIGRlZmluZWQnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgdmFyaWFudCA9IGpvYltqb2IudmFyaWFudF07XG4gICAgICBpZiAoIXZhcmlhbnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgam9iLiR7am9iLnZhcmlhbnR9IHRvIGJlIHNldGApO1xuICAgICAgfVxuICAgICAgLy8gVGhlIG9ubHkgam9iIHRoYXQgY2FuIGJlIGV4ZWN1dGVkIG9uIGEgY29tcGxldGVkIHdvcmtmbG93IGlzIGEgcXVlcnkuXG4gICAgICAvLyBXZSBtaWdodCBnZXQgb3RoZXIgam9icyBhZnRlciBjb21wbGV0aW9uIGZvciBpbnN0YW5jZSB3aGVuIGEgc2luZ2xlXG4gICAgICAvLyBhY3RpdmF0aW9uIGNvbnRhaW5zIG11bHRpcGxlIGpvYnMgYW5kIHRoZSBmaXJzdCBvbmUgY29tcGxldGVzIHRoZSB3b3JrZmxvdy5cbiAgICAgIGlmIChhY3RpdmF0b3IuY29tcGxldGVkICYmIGpvYi52YXJpYW50ICE9PSAncXVlcnlXb3JrZmxvdycpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgYWN0aXZhdG9yW2pvYi52YXJpYW50XSh2YXJpYW50IGFzIGFueSAvKiBUUyBjYW4ndCBpbmZlciB0aGlzIHR5cGUgKi8pO1xuICAgICAgaWYgKHNob3VsZFVuYmxvY2tDb25kaXRpb25zKGpvYikpIHtcbiAgICAgICAgdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICBpbnRlcmNlcHQoe1xuICAgIGFjdGl2YXRpb24sXG4gICAgYmF0Y2hJbmRleCxcbiAgfSk7XG59XG5cbi8qKlxuICogQ29uY2x1ZGUgYSBzaW5nbGUgYWN0aXZhdGlvbi5cbiAqIFNob3VsZCBiZSBjYWxsZWQgYWZ0ZXIgcHJvY2Vzc2luZyBhbGwgYWN0aXZhdGlvbiBqb2JzIGFuZCBxdWV1ZWQgbWljcm90YXNrcy5cbiAqXG4gKiBBY3RpdmF0aW9uIGZhaWx1cmVzIGFyZSBoYW5kbGVkIGluIHRoZSBtYWluIE5vZGUuanMgaXNvbGF0ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmNsdWRlQWN0aXZhdGlvbigpOiBjb3Jlc2RrLndvcmtmbG93X2NvbXBsZXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkNvbXBsZXRpb24ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgYWN0aXZhdG9yLnJlamVjdEJ1ZmZlcmVkVXBkYXRlcygpO1xuICBjb25zdCBpbnRlcmNlcHQgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnY29uY2x1ZGVBY3RpdmF0aW9uJywgKGlucHV0KSA9PiBpbnB1dCk7XG4gIGNvbnN0IHsgaW5mbyB9ID0gYWN0aXZhdG9yO1xuICBjb25zdCB7IGNvbW1hbmRzIH0gPSBpbnRlcmNlcHQoeyBjb21tYW5kczogYWN0aXZhdG9yLmdldEFuZFJlc2V0Q29tbWFuZHMoKSB9KTtcblxuICByZXR1cm4ge1xuICAgIHJ1bklkOiBpbmZvLnJ1bklkLFxuICAgIHN1Y2Nlc3NmdWw6IHsgY29tbWFuZHMgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEFuZFJlc2V0U2lua0NhbGxzKCk6IFNpbmtDYWxsW10ge1xuICByZXR1cm4gZ2V0QWN0aXZhdG9yKCkuZ2V0QW5kUmVzZXRTaW5rQ2FsbHMoKTtcbn1cblxuLyoqXG4gKiBMb29wIHRocm91Z2ggYWxsIGJsb2NrZWQgY29uZGl0aW9ucywgZXZhbHVhdGUgYW5kIHVuYmxvY2sgaWYgcG9zc2libGUuXG4gKlxuICogQHJldHVybnMgbnVtYmVyIG9mIHVuYmxvY2tlZCBjb25kaXRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJ5VW5ibG9ja0NvbmRpdGlvbnMoKTogbnVtYmVyIHtcbiAgbGV0IG51bVVuYmxvY2tlZCA9IDA7XG4gIGZvciAoOzspIHtcbiAgICBjb25zdCBwcmV2VW5ibG9ja2VkID0gbnVtVW5ibG9ja2VkO1xuICAgIGZvciAoY29uc3QgW3NlcSwgY29uZF0gb2YgZ2V0QWN0aXZhdG9yKCkuYmxvY2tlZENvbmRpdGlvbnMuZW50cmllcygpKSB7XG4gICAgICBpZiAoY29uZC5mbigpKSB7XG4gICAgICAgIGNvbmQucmVzb2x2ZSgpO1xuICAgICAgICBudW1VbmJsb2NrZWQrKztcbiAgICAgICAgLy8gSXQgaXMgc2FmZSB0byBkZWxldGUgZWxlbWVudHMgZHVyaW5nIG1hcCBpdGVyYXRpb25cbiAgICAgICAgZ2V0QWN0aXZhdG9yKCkuYmxvY2tlZENvbmRpdGlvbnMuZGVsZXRlKHNlcSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChwcmV2VW5ibG9ja2VkID09PSBudW1VbmJsb2NrZWQpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbnVtVW5ibG9ja2VkO1xufVxuXG4vKipcbiAqIFByZWRpY2F0ZSB1c2VkIHRvIHByZXZlbnQgdHJpZ2dlcmluZyBjb25kaXRpb25zIGZvciBub24tcXVlcnkgYW5kIG5vbi1wYXRjaCBqb2JzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2hvdWxkVW5ibG9ja0NvbmRpdGlvbnMoam9iOiBjb3Jlc2RrLndvcmtmbG93X2FjdGl2YXRpb24uSVdvcmtmbG93QWN0aXZhdGlvbkpvYik6IGJvb2xlYW4ge1xuICByZXR1cm4gIWpvYi5xdWVyeVdvcmtmbG93ICYmICFqb2Iubm90aWZ5SGFzUGF0Y2g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkaXNwb3NlKCk6IHZvaWQge1xuICBjb25zdCBkaXNwb3NlID0gY29tcG9zZUludGVyY2VwdG9ycyhnZXRBY3RpdmF0b3IoKS5pbnRlcmNlcHRvcnMuaW50ZXJuYWxzLCAnZGlzcG9zZScsIGFzeW5jICgpID0+IHtcbiAgICBkaXNhYmxlU3RvcmFnZSgpO1xuICB9KTtcbiAgZGlzcG9zZSh7fSk7XG59XG4iLCJpbXBvcnQge1xuICBBY3Rpdml0eUZ1bmN0aW9uLFxuICBBY3Rpdml0eU9wdGlvbnMsXG4gIGNvbXBpbGVSZXRyeVBvbGljeSxcbiAgZXh0cmFjdFdvcmtmbG93VHlwZSxcbiAgSWxsZWdhbFN0YXRlRXJyb3IsXG4gIExvY2FsQWN0aXZpdHlPcHRpb25zLFxuICBtYXBUb1BheWxvYWRzLFxuICBRdWVyeURlZmluaXRpb24sXG4gIHNlYXJjaEF0dHJpYnV0ZVBheWxvYWRDb252ZXJ0ZXIsXG4gIFNlYXJjaEF0dHJpYnV0ZXMsXG4gIFNpZ25hbERlZmluaXRpb24sXG4gIHRvUGF5bG9hZHMsXG4gIFVudHlwZWRBY3Rpdml0aWVzLFxuICBVcGRhdGVEZWZpbml0aW9uLFxuICBXaXRoV29ya2Zsb3dBcmdzLFxuICBXb3JrZmxvdyxcbiAgV29ya2Zsb3dSZXN1bHRUeXBlLFxuICBXb3JrZmxvd1JldHVyblR5cGUsXG4gIFdvcmtmbG93VXBkYXRlVmFsaWRhdG9yVHlwZSxcbn0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uJztcbmltcG9ydCB7IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvIH0gZnJvbSAnQHRlbXBvcmFsaW8vY29tbW9uL2xpYi92ZXJzaW9uaW5nLWludGVudC1lbnVtJztcbmltcG9ydCB7IER1cmF0aW9uLCBtc09wdGlvbmFsVG9UcywgbXNUb051bWJlciwgbXNUb1RzLCB0c1RvTXMgfSBmcm9tICdAdGVtcG9yYWxpby9jb21tb24vbGliL3RpbWUnO1xuaW1wb3J0IHsgY29tcG9zZUludGVyY2VwdG9ycyB9IGZyb20gJ0B0ZW1wb3JhbGlvL2NvbW1vbi9saWIvaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7IHRlbXBvcmFsIH0gZnJvbSAnQHRlbXBvcmFsaW8vcHJvdG8nO1xuaW1wb3J0IHsgQ2FuY2VsbGF0aW9uU2NvcGUsIHJlZ2lzdGVyU2xlZXBJbXBsZW1lbnRhdGlvbiB9IGZyb20gJy4vY2FuY2VsbGF0aW9uLXNjb3BlJztcbmltcG9ydCB7XG4gIEFjdGl2aXR5SW5wdXQsXG4gIExvY2FsQWN0aXZpdHlJbnB1dCxcbiAgU2lnbmFsV29ya2Zsb3dJbnB1dCxcbiAgU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQsXG4gIFRpbWVySW5wdXQsXG59IGZyb20gJy4vaW50ZXJjZXB0b3JzJztcbmltcG9ydCB7XG4gIENoaWxkV29ya2Zsb3dDYW5jZWxsYXRpb25UeXBlLFxuICBDaGlsZFdvcmtmbG93T3B0aW9ucyxcbiAgQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMsXG4gIENvbnRpbnVlQXNOZXcsXG4gIENvbnRpbnVlQXNOZXdPcHRpb25zLFxuICBEZWZhdWx0U2lnbmFsSGFuZGxlcixcbiAgRW5oYW5jZWRTdGFja1RyYWNlLFxuICBIYW5kbGVyLFxuICBRdWVyeUhhbmRsZXJPcHRpb25zLFxuICBTaWduYWxIYW5kbGVyT3B0aW9ucyxcbiAgVXBkYXRlSGFuZGxlck9wdGlvbnMsXG4gIFdvcmtmbG93SW5mbyxcbn0gZnJvbSAnLi9pbnRlcmZhY2VzJztcbmltcG9ydCB7IExvY2FsQWN0aXZpdHlEb0JhY2tvZmYgfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQgeyBhc3NlcnRJbldvcmtmbG93Q29udGV4dCwgZ2V0QWN0aXZhdG9yLCBtYXliZUdldEFjdGl2YXRvciB9IGZyb20gJy4vZ2xvYmFsLWF0dHJpYnV0ZXMnO1xuaW1wb3J0IHsgdW50cmFja1Byb21pc2UgfSBmcm9tICcuL3N0YWNrLWhlbHBlcnMnO1xuaW1wb3J0IHsgQ2hpbGRXb3JrZmxvd0hhbmRsZSwgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB9IGZyb20gJy4vd29ya2Zsb3ctaGFuZGxlJztcblxuLy8gQXZvaWQgYSBjaXJjdWxhciBkZXBlbmRlbmN5XG5yZWdpc3RlclNsZWVwSW1wbGVtZW50YXRpb24oc2xlZXApO1xuXG4vKipcbiAqIEFkZHMgZGVmYXVsdCB2YWx1ZXMgdG8gYHdvcmtmbG93SWRgIGFuZCBgd29ya2Zsb3dJZFJldXNlUG9saWN5YCB0byBnaXZlbiB3b3JrZmxvdyBvcHRpb25zLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9uczxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICBvcHRzOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogQ2hpbGRXb3JrZmxvd09wdGlvbnNXaXRoRGVmYXVsdHMge1xuICBjb25zdCB7IGFyZ3MsIHdvcmtmbG93SWQsIC4uLnJlc3QgfSA9IG9wdHM7XG4gIHJldHVybiB7XG4gICAgd29ya2Zsb3dJZDogd29ya2Zsb3dJZCA/PyB1dWlkNCgpLFxuICAgIGFyZ3M6IGFyZ3MgPz8gW10sXG4gICAgY2FuY2VsbGF0aW9uVHlwZTogQ2hpbGRXb3JrZmxvd0NhbmNlbGxhdGlvblR5cGUuV0FJVF9DQU5DRUxMQVRJT05fQ09NUExFVEVELFxuICAgIC4uLnJlc3QsXG4gIH07XG59XG5cbi8qKlxuICogUHVzaCBhIHN0YXJ0VGltZXIgY29tbWFuZCBpbnRvIHN0YXRlIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHRpbWVyTmV4dEhhbmRsZXIoaW5wdXQ6IFRpbWVySW5wdXQpIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgY29uc3Qgc2NvcGUgPSBDYW5jZWxsYXRpb25TY29wZS5jdXJyZW50KCk7XG4gICAgaWYgKHNjb3BlLmNvbnNpZGVyZWRDYW5jZWxsZWQpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaChyZWplY3QpKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy50aW1lci5kZWxldGUoaW5wdXQuc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBBbHJlYWR5IHJlc29sdmVkIG9yIG5ldmVyIHNjaGVkdWxlZFxuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgICAgICAgY2FuY2VsVGltZXI6IHtcbiAgICAgICAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHN0YXJ0VGltZXI6IHtcbiAgICAgICAgc2VxOiBpbnB1dC5zZXEsXG4gICAgICAgIHN0YXJ0VG9GaXJlVGltZW91dDogbXNUb1RzKGlucHV0LmR1cmF0aW9uTXMpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMudGltZXIuc2V0KGlucHV0LnNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogQXN5bmNocm9ub3VzIHNsZWVwLlxuICpcbiAqIFNjaGVkdWxlcyBhIHRpbWVyIG9uIHRoZSBUZW1wb3JhbCBzZXJ2aWNlLlxuICpcbiAqIEBwYXJhbSBtcyBzbGVlcCBkdXJhdGlvbiAtIG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ30uXG4gKiBJZiBnaXZlbiBhIG5lZ2F0aXZlIG51bWJlciBvciAwLCB2YWx1ZSB3aWxsIGJlIHNldCB0byAxLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlZXAobXM6IER1cmF0aW9uKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zbGVlcCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbicpO1xuICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMudGltZXIrKztcblxuICBjb25zdCBkdXJhdGlvbk1zID0gTWF0aC5tYXgoMSwgbXNUb051bWJlcihtcykpO1xuXG4gIGNvbnN0IGV4ZWN1dGUgPSBjb21wb3NlSW50ZXJjZXB0b3JzKGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsICdzdGFydFRpbWVyJywgdGltZXJOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGR1cmF0aW9uTXMsXG4gICAgc2VxLFxuICB9KTtcbn1cblxuZnVuY3Rpb24gdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogdm9pZCB7XG4gIGlmIChvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlcXVpcmVkIGVpdGhlciBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0IG9yIHN0YXJ0VG9DbG9zZVRpbWVvdXQnKTtcbiAgfVxufVxuXG4vLyBVc2Ugc2FtZSB2YWxpZGF0aW9uIHdlIHVzZSBmb3Igbm9ybWFsIGFjdGl2aXRpZXNcbmNvbnN0IHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMgPSB2YWxpZGF0ZUFjdGl2aXR5T3B0aW9ucztcblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gYWN0aXZhdG9yIGFjY3VtdWxhdG9yIGFuZCByZWdpc3RlciBjb21wbGV0aW9uXG4gKi9cbmZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcih7IG9wdGlvbnMsIGFyZ3MsIGhlYWRlcnMsIHNlcSwgYWN0aXZpdHlUeXBlIH06IEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIHZhbGlkYXRlQWN0aXZpdHlPcHRpb25zKG9wdGlvbnMpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuaGFzKHNlcSkpIHtcbiAgICAgICAgICAgIHJldHVybjsgLy8gQWxyZWFkeSByZXNvbHZlZCBvciBuZXZlciBzY2hlZHVsZWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICAgIHJlcXVlc3RDYW5jZWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlQWN0aXZpdHk6IHtcbiAgICAgICAgc2VxLFxuICAgICAgICBhY3Rpdml0eUlkOiBvcHRpb25zLmFjdGl2aXR5SWQgPz8gYCR7c2VxfWAsXG4gICAgICAgIGFjdGl2aXR5VHlwZSxcbiAgICAgICAgYXJndW1lbnRzOiB0b1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCAuLi5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICBoZWFydGJlYXRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLmhlYXJ0YmVhdFRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzdGFydFRvQ2xvc2VUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnN0YXJ0VG9DbG9zZVRpbWVvdXQpLFxuICAgICAgICBzY2hlZHVsZVRvU3RhcnRUaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLnNjaGVkdWxlVG9TdGFydFRpbWVvdXQpLFxuICAgICAgICBoZWFkZXJzLFxuICAgICAgICBjYW5jZWxsYXRpb25UeXBlOiBvcHRpb25zLmNhbmNlbGxhdGlvblR5cGUsXG4gICAgICAgIGRvTm90RWFnZXJseUV4ZWN1dGU6ICEob3B0aW9ucy5hbGxvd0VhZ2VyRGlzcGF0Y2ggPz8gdHJ1ZSksXG4gICAgICAgIHZlcnNpb25pbmdJbnRlbnQ6IHZlcnNpb25pbmdJbnRlbnRUb1Byb3RvKG9wdGlvbnMudmVyc2lvbmluZ0ludGVudCksXG4gICAgICB9LFxuICAgIH0pO1xuICAgIGFjdGl2YXRvci5jb21wbGV0aW9ucy5hY3Rpdml0eS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBQdXNoIGEgc2NoZWR1bGVBY3Rpdml0eSBjb21tYW5kIGludG8gc3RhdGUgYWNjdW11bGF0b3IgYW5kIHJlZ2lzdGVyIGNvbXBsZXRpb25cbiAqL1xuYXN5bmMgZnVuY3Rpb24gc2NoZWR1bGVMb2NhbEFjdGl2aXR5TmV4dEhhbmRsZXIoe1xuICBvcHRpb25zLFxuICBhcmdzLFxuICBoZWFkZXJzLFxuICBzZXEsXG4gIGFjdGl2aXR5VHlwZSxcbiAgYXR0ZW1wdCxcbiAgb3JpZ2luYWxTY2hlZHVsZVRpbWUsXG59OiBMb2NhbEFjdGl2aXR5SW5wdXQpOiBQcm9taXNlPHVua25vd24+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gZ2V0QWN0aXZhdG9yKCk7XG4gIC8vIEVhZ2VybHkgZmFpbCB0aGUgbG9jYWwgYWN0aXZpdHkgKHdoaWNoIHdpbGwgaW4gdHVybiBmYWlsIHRoZSB3b3JrZmxvdyB0YXNrLlxuICAvLyBEbyBub3QgZmFpbCBvbiByZXBsYXkgd2hlcmUgdGhlIGxvY2FsIGFjdGl2aXRpZXMgbWF5IG5vdCBiZSByZWdpc3RlcmVkIG9uIHRoZSByZXBsYXkgd29ya2VyLlxuICBpZiAoIWFjdGl2YXRvci5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyAmJiAhYWN0aXZhdG9yLnJlZ2lzdGVyZWRBY3Rpdml0eU5hbWVzLmhhcyhhY3Rpdml0eVR5cGUpKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKGBMb2NhbCBhY3Rpdml0eSBvZiB0eXBlICcke2FjdGl2aXR5VHlwZX0nIG5vdCByZWdpc3RlcmVkIG9uIHdvcmtlcmApO1xuICB9XG4gIHZhbGlkYXRlTG9jYWxBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgdW50cmFja1Byb21pc2Uoc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKHJlamVjdCkpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2NvcGUuY2FuY2VsbGFibGUpIHtcbiAgICAgIHVudHJhY2tQcm9taXNlKFxuICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgIGlmICghYWN0aXZhdG9yLmNvbXBsZXRpb25zLmFjdGl2aXR5LmhhcyhzZXEpKSB7XG4gICAgICAgICAgICByZXR1cm47IC8vIEFscmVhZHkgcmVzb2x2ZWQgb3IgbmV2ZXIgc2NoZWR1bGVkXG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICByZXF1ZXN0Q2FuY2VsTG9jYWxBY3Rpdml0eToge1xuICAgICAgICAgICAgICBzZXEsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNjaGVkdWxlTG9jYWxBY3Rpdml0eToge1xuICAgICAgICBzZXEsXG4gICAgICAgIGF0dGVtcHQsXG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxuICAgICAgICAvLyBJbnRlbnRpb25hbGx5IG5vdCBleHBvc2luZyBhY3Rpdml0eUlkIGFzIGFuIG9wdGlvblxuICAgICAgICBhY3Rpdml0eUlkOiBgJHtzZXF9YCxcbiAgICAgICAgYWN0aXZpdHlUeXBlLFxuICAgICAgICBhcmd1bWVudHM6IHRvUGF5bG9hZHMoYWN0aXZhdG9yLnBheWxvYWRDb252ZXJ0ZXIsIC4uLmFyZ3MpLFxuICAgICAgICByZXRyeVBvbGljeTogb3B0aW9ucy5yZXRyeSA/IGNvbXBpbGVSZXRyeVBvbGljeShvcHRpb25zLnJldHJ5KSA6IHVuZGVmaW5lZCxcbiAgICAgICAgc2NoZWR1bGVUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc3RhcnRUb0Nsb3NlVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zdGFydFRvQ2xvc2VUaW1lb3V0KSxcbiAgICAgICAgc2NoZWR1bGVUb1N0YXJ0VGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5zY2hlZHVsZVRvU3RhcnRUaW1lb3V0KSxcbiAgICAgICAgbG9jYWxSZXRyeVRocmVzaG9sZDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy5sb2NhbFJldHJ5VGhyZXNob2xkKSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgY2FuY2VsbGF0aW9uVHlwZTogb3B0aW9ucy5jYW5jZWxsYXRpb25UeXBlLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuYWN0aXZpdHkuc2V0KHNlcSwge1xuICAgICAgcmVzb2x2ZSxcbiAgICAgIHJlamVjdCxcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogU2NoZWR1bGUgYW4gYWN0aXZpdHkgYW5kIHJ1biBvdXRib3VuZCBpbnRlcmNlcHRvcnNcbiAqIEBoaWRkZW5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjaGVkdWxlQWN0aXZpdHk8Uj4oYWN0aXZpdHlUeXBlOiBzdHJpbmcsIGFyZ3M6IGFueVtdLCBvcHRpb25zOiBBY3Rpdml0eU9wdGlvbnMpOiBQcm9taXNlPFI+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnNjaGVkdWxlQWN0aXZpdHkoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24nXG4gICk7XG4gIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdHb3QgZW1wdHkgYWN0aXZpdHkgb3B0aW9ucycpO1xuICB9XG4gIGNvbnN0IHNlcSA9IGFjdGl2YXRvci5uZXh0U2Vxcy5hY3Rpdml0eSsrO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLCAnc2NoZWR1bGVBY3Rpdml0eScsIHNjaGVkdWxlQWN0aXZpdHlOZXh0SGFuZGxlcik7XG5cbiAgcmV0dXJuIGV4ZWN1dGUoe1xuICAgIGFjdGl2aXR5VHlwZSxcbiAgICBoZWFkZXJzOiB7fSxcbiAgICBvcHRpb25zLFxuICAgIGFyZ3MsXG4gICAgc2VxLFxuICB9KSBhcyBQcm9taXNlPFI+O1xufVxuXG4vKipcbiAqIFNjaGVkdWxlIGFuIGFjdGl2aXR5IGFuZCBydW4gb3V0Ym91bmQgaW50ZXJjZXB0b3JzXG4gKiBAaGlkZGVuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzY2hlZHVsZUxvY2FsQWN0aXZpdHk8Uj4oXG4gIGFjdGl2aXR5VHlwZTogc3RyaW5nLFxuICBhcmdzOiBhbnlbXSxcbiAgb3B0aW9uczogTG9jYWxBY3Rpdml0eU9wdGlvbnNcbik6IFByb21pc2U8Uj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2NoZWR1bGVMb2NhbEFjdGl2aXR5KC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uJ1xuICApO1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignR290IGVtcHR5IGFjdGl2aXR5IG9wdGlvbnMnKTtcbiAgfVxuXG4gIGxldCBhdHRlbXB0ID0gMTtcbiAgbGV0IG9yaWdpbmFsU2NoZWR1bGVUaW1lID0gdW5kZWZpbmVkO1xuXG4gIGZvciAoOzspIHtcbiAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuYWN0aXZpdHkrKztcbiAgICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICAgIGFjdGl2YXRvci5pbnRlcmNlcHRvcnMub3V0Ym91bmQsXG4gICAgICAnc2NoZWR1bGVMb2NhbEFjdGl2aXR5JyxcbiAgICAgIHNjaGVkdWxlTG9jYWxBY3Rpdml0eU5leHRIYW5kbGVyXG4gICAgKTtcblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gKGF3YWl0IGV4ZWN1dGUoe1xuICAgICAgICBhY3Rpdml0eVR5cGUsXG4gICAgICAgIGhlYWRlcnM6IHt9LFxuICAgICAgICBvcHRpb25zLFxuICAgICAgICBhcmdzLFxuICAgICAgICBzZXEsXG4gICAgICAgIGF0dGVtcHQsXG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lLFxuICAgICAgfSkpIGFzIFByb21pc2U8Uj47XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBpZiAoZXJyIGluc3RhbmNlb2YgTG9jYWxBY3Rpdml0eURvQmFja29mZikge1xuICAgICAgICBhd2FpdCBzbGVlcCh0c1RvTXMoZXJyLmJhY2tvZmYuYmFja29mZkR1cmF0aW9uKSk7XG4gICAgICAgIGlmICh0eXBlb2YgZXJyLmJhY2tvZmYuYXR0ZW1wdCAhPT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGJhY2tvZmYgYXR0ZW1wdCB0eXBlJyk7XG4gICAgICAgIH1cbiAgICAgICAgYXR0ZW1wdCA9IGVyci5iYWNrb2ZmLmF0dGVtcHQ7XG4gICAgICAgIG9yaWdpbmFsU2NoZWR1bGVUaW1lID0gZXJyLmJhY2tvZmYub3JpZ2luYWxTY2hlZHVsZVRpbWUgPz8gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlcih7XG4gIG9wdGlvbnMsXG4gIGhlYWRlcnMsXG4gIHdvcmtmbG93VHlwZSxcbiAgc2VxLFxufTogU3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uSW5wdXQpOiBQcm9taXNlPFtQcm9taXNlPHN0cmluZz4sIFByb21pc2U8dW5rbm93bj5dPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICBjb25zdCB3b3JrZmxvd0lkID0gb3B0aW9ucy53b3JrZmxvd0lkID8/IHV1aWQ0KCk7XG4gIGNvbnN0IHN0YXJ0UHJvbWlzZSA9IG5ldyBQcm9taXNlPHN0cmluZz4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgY29uc3QgY29tcGxldGUgPSAhYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5oYXMoc2VxKTtcblxuICAgICAgICAgIGlmICghY29tcGxldGUpIHtcbiAgICAgICAgICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICAgICAgICAgIGNhbmNlbENoaWxkV29ya2Zsb3dFeGVjdXRpb246IHsgY2hpbGRXb3JrZmxvd1NlcTogc2VxIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gTm90aGluZyB0byBjYW5jZWwgb3RoZXJ3aXNlXG4gICAgICAgIH0pXG4gICAgICApO1xuICAgIH1cbiAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgICAgc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgd29ya2Zsb3dJZCxcbiAgICAgICAgd29ya2Zsb3dUeXBlLFxuICAgICAgICBpbnB1dDogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4ub3B0aW9ucy5hcmdzKSxcbiAgICAgICAgcmV0cnlQb2xpY3k6IG9wdGlvbnMucmV0cnkgPyBjb21waWxlUmV0cnlQb2xpY3kob3B0aW9ucy5yZXRyeSkgOiB1bmRlZmluZWQsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUgfHwgYWN0aXZhdG9yLmluZm8udGFza1F1ZXVlLFxuICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvblRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dFeGVjdXRpb25UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dSdW5UaW1lb3V0OiBtc09wdGlvbmFsVG9UcyhvcHRpb25zLndvcmtmbG93UnVuVGltZW91dCksXG4gICAgICAgIHdvcmtmbG93VGFza1RpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dUYXNrVGltZW91dCksXG4gICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLCAvLyBOb3QgY29uZmlndXJhYmxlXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIGNhbmNlbGxhdGlvblR5cGU6IG9wdGlvbnMuY2FuY2VsbGF0aW9uVHlwZSxcbiAgICAgICAgd29ya2Zsb3dJZFJldXNlUG9saWN5OiBvcHRpb25zLndvcmtmbG93SWRSZXVzZVBvbGljeSxcbiAgICAgICAgcGFyZW50Q2xvc2VQb2xpY3k6IG9wdGlvbnMucGFyZW50Q2xvc2VQb2xpY3ksXG4gICAgICAgIGNyb25TY2hlZHVsZTogb3B0aW9ucy5jcm9uU2NoZWR1bGUsXG4gICAgICAgIHNlYXJjaEF0dHJpYnV0ZXM6IG9wdGlvbnMuc2VhcmNoQXR0cmlidXRlc1xuICAgICAgICAgID8gbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICB2ZXJzaW9uaW5nSW50ZW50OiB2ZXJzaW9uaW5nSW50ZW50VG9Qcm90byhvcHRpb25zLnZlcnNpb25pbmdJbnRlbnQpLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3IuY29tcGxldGlvbnMuY2hpbGRXb3JrZmxvd1N0YXJ0LnNldChzZXEsIHtcbiAgICAgIHJlc29sdmUsXG4gICAgICByZWplY3QsXG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFdlIGNvbnN0cnVjdCBhIFByb21pc2UgZm9yIHRoZSBjb21wbGV0aW9uIG9mIHRoZSBjaGlsZCBXb3JrZmxvdyBiZWZvcmUgd2Uga25vd1xuICAvLyBpZiB0aGUgV29ya2Zsb3cgY29kZSB3aWxsIGF3YWl0IGl0IHRvIGNhcHR1cmUgdGhlIHJlc3VsdCBpbiBjYXNlIGl0IGRvZXMuXG4gIGNvbnN0IGNvbXBsZXRlUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAvLyBDaGFpbiBzdGFydCBQcm9taXNlIHJlamVjdGlvbiB0byB0aGUgY29tcGxldGUgUHJvbWlzZS5cbiAgICB1bnRyYWNrUHJvbWlzZShzdGFydFByb21pc2UuY2F0Y2gocmVqZWN0KSk7XG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNoaWxkV29ya2Zsb3dDb21wbGV0ZS5zZXQoc2VxLCB7XG4gICAgICByZXNvbHZlLFxuICAgICAgcmVqZWN0LFxuICAgIH0pO1xuICB9KTtcbiAgdW50cmFja1Byb21pc2Uoc3RhcnRQcm9taXNlKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlKTtcbiAgLy8gUHJldmVudCB1bmhhbmRsZWQgcmVqZWN0aW9uIGJlY2F1c2UgdGhlIGNvbXBsZXRpb24gbWlnaHQgbm90IGJlIGF3YWl0ZWRcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVQcm9taXNlLmNhdGNoKCgpID0+IHVuZGVmaW5lZCkpO1xuICBjb25zdCByZXQgPSBuZXcgUHJvbWlzZTxbUHJvbWlzZTxzdHJpbmc+LCBQcm9taXNlPHVua25vd24+XT4oKHJlc29sdmUpID0+IHJlc29sdmUoW3N0YXJ0UHJvbWlzZSwgY29tcGxldGVQcm9taXNlXSkpO1xuICB1bnRyYWNrUHJvbWlzZShyZXQpO1xuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyKHsgc2VxLCBzaWduYWxOYW1lLCBhcmdzLCB0YXJnZXQsIGhlYWRlcnMgfTogU2lnbmFsV29ya2Zsb3dJbnB1dCkge1xuICBjb25zdCBhY3RpdmF0b3IgPSBnZXRBY3RpdmF0b3IoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShcbiAgICAgICAgc2NvcGUuY2FuY2VsUmVxdWVzdGVkLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICBpZiAoIWFjdGl2YXRvci5jb21wbGV0aW9ucy5zaWduYWxXb3JrZmxvdy5oYXMoc2VxKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBhY3RpdmF0b3IucHVzaENvbW1hbmQoeyBjYW5jZWxTaWduYWxXb3JrZmxvdzogeyBzZXEgfSB9KTtcbiAgICAgICAgfSlcbiAgICAgICk7XG4gICAgfVxuICAgIGFjdGl2YXRvci5wdXNoQ29tbWFuZCh7XG4gICAgICBzaWduYWxFeHRlcm5hbFdvcmtmbG93RXhlY3V0aW9uOiB7XG4gICAgICAgIHNlcSxcbiAgICAgICAgYXJnczogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHNpZ25hbE5hbWUsXG4gICAgICAgIC4uLih0YXJnZXQudHlwZSA9PT0gJ2V4dGVybmFsJ1xuICAgICAgICAgID8ge1xuICAgICAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgICAgIG5hbWVzcGFjZTogYWN0aXZhdG9yLmluZm8ubmFtZXNwYWNlLFxuICAgICAgICAgICAgICAgIC4uLnRhcmdldC53b3JrZmxvd0V4ZWN1dGlvbixcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH1cbiAgICAgICAgICA6IHtcbiAgICAgICAgICAgICAgY2hpbGRXb3JrZmxvd0lkOiB0YXJnZXQuY2hpbGRXb3JrZmxvd0lkLFxuICAgICAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLnNpZ25hbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBTeW1ib2wgdXNlZCBpbiB0aGUgcmV0dXJuIHR5cGUgb2YgcHJveHkgbWV0aG9kcyB0byBtYXJrIHRoYXQgYW4gYXR0cmlidXRlIG9uIHRoZSBzb3VyY2UgdHlwZSBpcyBub3QgYSBtZXRob2QuXG4gKlxuICogQHNlZSB7QGxpbmsgQWN0aXZpdHlJbnRlcmZhY2VGb3J9XG4gKiBAc2VlIHtAbGluayBwcm94eUFjdGl2aXRpZXN9XG4gKiBAc2VlIHtAbGluayBwcm94eUxvY2FsQWN0aXZpdGllc31cbiAqL1xuZXhwb3J0IGNvbnN0IE5vdEFuQWN0aXZpdHlNZXRob2QgPSBTeW1ib2wuZm9yKCdfX1RFTVBPUkFMX05PVF9BTl9BQ1RJVklUWV9NRVRIT0QnKTtcblxuLyoqXG4gKiBUeXBlIGhlbHBlciB0aGF0IHRha2VzIGEgdHlwZSBgVGAgYW5kIHRyYW5zZm9ybXMgYXR0cmlidXRlcyB0aGF0IGFyZSBub3Qge0BsaW5rIEFjdGl2aXR5RnVuY3Rpb259IHRvXG4gKiB7QGxpbmsgTm90QW5BY3Rpdml0eU1ldGhvZH0uXG4gKlxuICogQGV4YW1wbGVcbiAqXG4gKiBVc2VkIGJ5IHtAbGluayBwcm94eUFjdGl2aXRpZXN9IHRvIGdldCB0aGlzIGNvbXBpbGUtdGltZSBlcnJvcjpcbiAqXG4gKiBgYGB0c1xuICogaW50ZXJmYWNlIE15QWN0aXZpdGllcyB7XG4gKiAgIHZhbGlkKGlucHV0OiBudW1iZXIpOiBQcm9taXNlPG51bWJlcj47XG4gKiAgIGludmFsaWQoaW5wdXQ6IG51bWJlcik6IG51bWJlcjtcbiAqIH1cbiAqXG4gKiBjb25zdCBhY3QgPSBwcm94eUFjdGl2aXRpZXM8TXlBY3Rpdml0aWVzPih7IHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScgfSk7XG4gKlxuICogYXdhaXQgYWN0LnZhbGlkKHRydWUpO1xuICogYXdhaXQgYWN0LmludmFsaWQoKTtcbiAqIC8vIF4gVFMgY29tcGxhaW5zIHdpdGg6XG4gKiAvLyAocHJvcGVydHkpIGludmFsaWREZWZpbml0aW9uOiB0eXBlb2YgTm90QW5BY3Rpdml0eU1ldGhvZFxuICogLy8gVGhpcyBleHByZXNzaW9uIGlzIG5vdCBjYWxsYWJsZS5cbiAqIC8vIFR5cGUgJ1N5bWJvbCcgaGFzIG5vIGNhbGwgc2lnbmF0dXJlcy4oMjM0OSlcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBBY3Rpdml0eUludGVyZmFjZUZvcjxUPiA9IHtcbiAgW0sgaW4ga2V5b2YgVF06IFRbS10gZXh0ZW5kcyBBY3Rpdml0eUZ1bmN0aW9uID8gVFtLXSA6IHR5cGVvZiBOb3RBbkFjdGl2aXR5TWV0aG9kO1xufTtcblxuLyoqXG4gKiBDb25maWd1cmUgQWN0aXZpdHkgZnVuY3Rpb25zIHdpdGggZ2l2ZW4ge0BsaW5rIEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fSBmb3JcbiAqICAgICAgICAgd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBleGFtcGxlXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcHJveHlBY3Rpdml0aWVzIH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICogaW1wb3J0ICogYXMgYWN0aXZpdGllcyBmcm9tICcuLi9hY3Rpdml0aWVzJztcbiAqXG4gKiAvLyBTZXR1cCBBY3Rpdml0aWVzIGZyb20gbW9kdWxlIGV4cG9ydHNcbiAqIGNvbnN0IHsgaHR0cEdldCwgb3RoZXJBY3Rpdml0eSB9ID0gcHJveHlBY3Rpdml0aWVzPHR5cGVvZiBhY3Rpdml0aWVzPih7XG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICczMCBtaW51dGVzJyxcbiAqIH0pO1xuICpcbiAqIC8vIFNldHVwIEFjdGl2aXRpZXMgZnJvbSBhbiBleHBsaWNpdCBpbnRlcmZhY2UgKGUuZy4gd2hlbiBkZWZpbmVkIGJ5IGFub3RoZXIgU0RLKVxuICogaW50ZXJmYWNlIEphdmFBY3Rpdml0aWVzIHtcbiAqICAgaHR0cEdldEZyb21KYXZhKHVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+XG4gKiAgIHNvbWVPdGhlckphdmFBY3Rpdml0eShhcmcxOiBudW1iZXIsIGFyZzI6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPjtcbiAqIH1cbiAqXG4gKiBjb25zdCB7XG4gKiAgIGh0dHBHZXRGcm9tSmF2YSxcbiAqICAgc29tZU90aGVySmF2YUFjdGl2aXR5XG4gKiB9ID0gcHJveHlBY3Rpdml0aWVzPEphdmFBY3Rpdml0aWVzPih7XG4gKiAgIHRhc2tRdWV1ZTogJ2phdmEtd29ya2VyLXRhc2tRdWV1ZScsXG4gKiAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6ICc1bScsXG4gKiB9KTtcbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gZXhlY3V0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAqICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBodHRwR2V0KFwiaHR0cDovL2V4YW1wbGUuY29tXCIpO1xuICogICAvLyAuLi5cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJveHlBY3Rpdml0aWVzPEEgPSBVbnR5cGVkQWN0aXZpdGllcz4ob3B0aW9uczogQWN0aXZpdHlPcHRpb25zKTogQWN0aXZpdHlJbnRlcmZhY2VGb3I8QT4ge1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyBWYWxpZGF0ZSBhcyBlYXJseSBhcyBwb3NzaWJsZSBmb3IgaW1tZWRpYXRlIHVzZXIgZmVlZGJhY2tcbiAgdmFsaWRhdGVBY3Rpdml0eU9wdGlvbnMob3B0aW9ucyk7XG4gIHJldHVybiBuZXcgUHJveHkoXG4gICAge30sXG4gICAge1xuICAgICAgZ2V0KF8sIGFjdGl2aXR5VHlwZSkge1xuICAgICAgICBpZiAodHlwZW9mIGFjdGl2aXR5VHlwZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBPbmx5IHN0cmluZ3MgYXJlIHN1cHBvcnRlZCBmb3IgQWN0aXZpdHkgdHlwZXMsIGdvdDogJHtTdHJpbmcoYWN0aXZpdHlUeXBlKX1gKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gYWN0aXZpdHlQcm94eUZ1bmN0aW9uKC4uLmFyZ3M6IHVua25vd25bXSk6IFByb21pc2U8dW5rbm93bj4ge1xuICAgICAgICAgIHJldHVybiBzY2hlZHVsZUFjdGl2aXR5KGFjdGl2aXR5VHlwZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8qKlxuICogQ29uZmlndXJlIExvY2FsIEFjdGl2aXR5IGZ1bmN0aW9ucyB3aXRoIGdpdmVuIHtAbGluayBMb2NhbEFjdGl2aXR5T3B0aW9uc30uXG4gKlxuICogVGhpcyBtZXRob2QgbWF5IGJlIGNhbGxlZCBtdWx0aXBsZSB0aW1lcyB0byBzZXR1cCBBY3Rpdml0aWVzIHdpdGggZGlmZmVyZW50IG9wdGlvbnMuXG4gKlxuICogQHJldHVybiBhIHtAbGluayBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9Qcm94eSB8IFByb3h5fVxuICogICAgICAgICBmb3Igd2hpY2ggZWFjaCBhdHRyaWJ1dGUgaXMgYSBjYWxsYWJsZSBBY3Rpdml0eSBmdW5jdGlvblxuICpcbiAqIEBzZWUge0BsaW5rIHByb3h5QWN0aXZpdGllc30gZm9yIGV4YW1wbGVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm94eUxvY2FsQWN0aXZpdGllczxBID0gVW50eXBlZEFjdGl2aXRpZXM+KG9wdGlvbnM6IExvY2FsQWN0aXZpdHlPcHRpb25zKTogQWN0aXZpdHlJbnRlcmZhY2VGb3I8QT4ge1xuICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignb3B0aW9ucyBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICAvLyBWYWxpZGF0ZSBhcyBlYXJseSBhcyBwb3NzaWJsZSBmb3IgaW1tZWRpYXRlIHVzZXIgZmVlZGJhY2tcbiAgdmFsaWRhdGVMb2NhbEFjdGl2aXR5T3B0aW9ucyhvcHRpb25zKTtcbiAgcmV0dXJuIG5ldyBQcm94eShcbiAgICB7fSxcbiAgICB7XG4gICAgICBnZXQoXywgYWN0aXZpdHlUeXBlKSB7XG4gICAgICAgIGlmICh0eXBlb2YgYWN0aXZpdHlUeXBlICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYE9ubHkgc3RyaW5ncyBhcmUgc3VwcG9ydGVkIGZvciBBY3Rpdml0eSB0eXBlcywgZ290OiAke1N0cmluZyhhY3Rpdml0eVR5cGUpfWApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBsb2NhbEFjdGl2aXR5UHJveHlGdW5jdGlvbiguLi5hcmdzOiB1bmtub3duW10pIHtcbiAgICAgICAgICByZXR1cm4gc2NoZWR1bGVMb2NhbEFjdGl2aXR5KGFjdGl2aXR5VHlwZSwgYXJncywgb3B0aW9ucyk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH1cbiAgKSBhcyBhbnk7XG59XG5cbi8vIFRPRE86IGRlcHJlY2F0ZSB0aGlzIHBhdGNoIGFmdGVyIFwiZW5vdWdoXCIgdGltZSBoYXMgcGFzc2VkXG5jb25zdCBFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0ggPSAnX190ZW1wb3JhbF9pbnRlcm5hbF9jb25uZWN0X2V4dGVybmFsX2hhbmRsZV9jYW5jZWxfdG9fc2NvcGUnO1xuLy8gVGhlIG5hbWUgb2YgdGhpcyBwYXRjaCBjb21lcyBmcm9tIGFuIGF0dGVtcHQgdG8gYnVpbGQgYSBnZW5lcmljIGludGVybmFsIHBhdGNoaW5nIG1lY2hhbmlzbS5cbi8vIFRoYXQgZWZmb3J0IGhhcyBiZWVuIGFiYW5kb25lZCBpbiBmYXZvciBvZiBhIG5ld2VyIFdvcmtmbG93VGFza0NvbXBsZXRlZE1ldGFkYXRhIGJhc2VkIG1lY2hhbmlzbS5cbmNvbnN0IENPTkRJVElPTl8wX1BBVENIID0gJ19fc2RrX2ludGVybmFsX3BhdGNoX251bWJlcjoxJztcblxuLyoqXG4gKiBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgY2FuIGJlIHVzZWQgdG8gc2lnbmFsIGFuZCBjYW5jZWwgYW4gZXhpc3RpbmcgV29ya2Zsb3cgZXhlY3V0aW9uLlxuICogSXQgdGFrZXMgYSBXb3JrZmxvdyBJRCBhbmQgb3B0aW9uYWwgcnVuIElELlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSh3b3JrZmxvd0lkOiBzdHJpbmcsIHJ1bklkPzogc3RyaW5nKTogRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZSB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy5nZXRFeHRlcm5hbFdvcmtmbG93SGFuZGxlKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLiBDb25zaWRlciB1c2luZyBDbGllbnQud29ya2Zsb3cuZ2V0SGFuZGxlKC4uLikgaW5zdGVhZC4pJ1xuICApO1xuICByZXR1cm4ge1xuICAgIHdvcmtmbG93SWQsXG4gICAgcnVuSWQsXG4gICAgY2FuY2VsKCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gQ29ubmVjdCB0aGlzIGNhbmNlbCBvcGVyYXRpb24gdG8gdGhlIGN1cnJlbnQgY2FuY2VsbGF0aW9uIHNjb3BlLlxuICAgICAgICAvLyBUaGlzIGlzIGJlaGF2aW9yIHdhcyBpbnRyb2R1Y2VkIGFmdGVyIHYwLjIyLjAgYW5kIGlzIGluY29tcGF0aWJsZVxuICAgICAgICAvLyB3aXRoIGhpc3RvcmllcyBnZW5lcmF0ZWQgd2l0aCBwcmV2aW91cyBTREsgdmVyc2lvbnMgYW5kIHRodXMgcmVxdWlyZXNcbiAgICAgICAgLy8gcGF0Y2hpbmcuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIHRyeSB0byBkZWxheSBwYXRjaGluZyBhcyBtdWNoIGFzIHBvc3NpYmxlIHRvIGF2b2lkIHBvbGx1dGluZ1xuICAgICAgICAvLyBoaXN0b3JpZXMgdW5sZXNzIHN0cmljdGx5IHJlcXVpcmVkLlxuICAgICAgICBjb25zdCBzY29wZSA9IENhbmNlbGxhdGlvblNjb3BlLmN1cnJlbnQoKTtcbiAgICAgICAgaWYgKHNjb3BlLmNhbmNlbGxhYmxlKSB7XG4gICAgICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgICAgICBzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgICAgICBpZiAocGF0Y2hlZChFWFRFUk5BTF9XRl9DQU5DRUxfUEFUQ0gpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcGUuY29uc2lkZXJlZENhbmNlbGxlZCkge1xuICAgICAgICAgIGlmIChwYXRjaGVkKEVYVEVSTkFMX1dGX0NBTkNFTF9QQVRDSCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBzZXEgPSBhY3RpdmF0b3IubmV4dFNlcXMuY2FuY2VsV29ya2Zsb3crKztcbiAgICAgICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgICAgICByZXF1ZXN0Q2FuY2VsRXh0ZXJuYWxXb3JrZmxvd0V4ZWN1dGlvbjoge1xuICAgICAgICAgICAgc2VxLFxuICAgICAgICAgICAgd29ya2Zsb3dFeGVjdXRpb246IHtcbiAgICAgICAgICAgICAgbmFtZXNwYWNlOiBhY3RpdmF0b3IuaW5mby5uYW1lc3BhY2UsXG4gICAgICAgICAgICAgIHdvcmtmbG93SWQsXG4gICAgICAgICAgICAgIHJ1bklkLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgYWN0aXZhdG9yLmNvbXBsZXRpb25zLmNhbmNlbFdvcmtmbG93LnNldChzZXEsIHsgcmVzb2x2ZSwgcmVqZWN0IH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2V4dGVybmFsJyxcbiAgICAgICAgICB3b3JrZmxvd0V4ZWN1dGlvbjogeyB3b3JrZmxvd0lkLCBydW5JZCB9LFxuICAgICAgICB9LFxuICAgICAgICBoZWFkZXJzOiB7fSxcbiAgICAgIH0pO1xuICAgIH0sXG4gIH07XG59XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb25cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBCeSBkZWZhdWx0LCBhIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogLSBSZXR1cm5zIGEgY2xpZW50LXNpZGUgaGFuZGxlIHRoYXQgaW1wbGVtZW50cyBhIGNoaWxkIFdvcmtmbG93IGludGVyZmFjZS5cbiAqIC0gRGVkdWNlcyB0aGUgV29ya2Zsb3cgdHlwZSBhbmQgc2lnbmF0dXJlIGZyb20gcHJvdmlkZWQgV29ya2Zsb3cgZnVuY3Rpb24uXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICpcbiAqIEEgY2hpbGQgV29ya2Zsb3cgaGFuZGxlIHN1cHBvcnRzIGF3YWl0aW5nIGNvbXBsZXRpb24sIHNpZ25hbGluZyBhbmQgY2FuY2VsbGF0aW9uIHZpYSB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqIEluIG9yZGVyIHRvIHF1ZXJ5IHRoZSBjaGlsZCwgdXNlIGEge0BsaW5rIFdvcmtmbG93Q2xpZW50fSBmcm9tIGFuIEFjdGl2aXR5LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3RhcnRDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd0Z1bmM6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPENoaWxkV29ya2Zsb3dIYW5kbGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uXG4gKlxuICogKipPdmVycmlkZSBmb3IgV29ya2Zsb3dzIHRoYXQgYWNjZXB0IG5vIGFyZ3VtZW50cyoqLlxuICpcbiAqIC0gUmV0dXJucyBhIGNsaWVudC1zaWRlIGhhbmRsZSB0aGF0IGltcGxlbWVudHMgYSBjaGlsZCBXb3JrZmxvdyBpbnRlcmZhY2UuXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKlxuICogQSBjaGlsZCBXb3JrZmxvdyBoYW5kbGUgc3VwcG9ydHMgYXdhaXRpbmcgY29tcGxldGlvbiwgc2lnbmFsaW5nIGFuZCBjYW5jZWxsYXRpb24gdmlhIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICogSW4gb3JkZXIgdG8gcXVlcnkgdGhlIGNoaWxkLCB1c2UgYSB7QGxpbmsgV29ya2Zsb3dDbGllbnR9IGZyb20gYW4gQWN0aXZpdHkuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydENoaWxkPFQgZXh0ZW5kcyAoKSA9PiBQcm9taXNlPGFueT4+KHdvcmtmbG93VHlwZTogc3RyaW5nKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuLyoqXG4gKiBTdGFydCBhIGNoaWxkIFdvcmtmbG93IGV4ZWN1dGlvblxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFJldHVybnMgYSBjbGllbnQtc2lkZSBoYW5kbGUgdGhhdCBpbXBsZW1lbnRzIGEgY2hpbGQgV29ya2Zsb3cgaW50ZXJmYWNlLlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhlIGNoaWxkIHdpbGwgYmUgc2NoZWR1bGVkIG9uIHRoZSBzYW1lIHRhc2sgcXVldWUgYXMgaXRzIHBhcmVudC5cbiAqXG4gKiBBIGNoaWxkIFdvcmtmbG93IGhhbmRsZSBzdXBwb3J0cyBhd2FpdGluZyBjb21wbGV0aW9uLCBzaWduYWxpbmcgYW5kIGNhbmNlbGxhdGlvbiB2aWEge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKiBJbiBvcmRlciB0byBxdWVyeSB0aGUgY2hpbGQsIHVzZSBhIHtAbGluayBXb3JrZmxvd0NsaWVudH0gZnJvbSBhbiBBY3Rpdml0eS5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzICgpID0+IFByb21pc2U8YW55Pj4od29ya2Zsb3dGdW5jOiBUKTogUHJvbWlzZTxDaGlsZFdvcmtmbG93SGFuZGxlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHN0YXJ0Q2hpbGQ8VCBleHRlbmRzIFdvcmtmbG93PihcbiAgd29ya2Zsb3dUeXBlT3JGdW5jOiBzdHJpbmcgfCBULFxuICBvcHRpb25zPzogV2l0aFdvcmtmbG93QXJnczxULCBDaGlsZFdvcmtmbG93T3B0aW9ucz5cbik6IFByb21pc2U8Q2hpbGRXb3JrZmxvd0hhbmRsZTxUPj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc3RhcnRDaGlsZCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LnN0YXJ0KC4uLikgaW5zdGVhZC4pJ1xuICApO1xuICBjb25zdCBvcHRpb25zV2l0aERlZmF1bHRzID0gYWRkRGVmYXVsdFdvcmtmbG93T3B0aW9ucyhvcHRpb25zID8/ICh7fSBhcyBhbnkpKTtcbiAgY29uc3Qgd29ya2Zsb3dUeXBlID0gZXh0cmFjdFdvcmtmbG93VHlwZSh3b3JrZmxvd1R5cGVPckZ1bmMpO1xuICBjb25zdCBleGVjdXRlID0gY29tcG9zZUludGVyY2VwdG9ycyhcbiAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICdzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb24nLFxuICAgIHN0YXJ0Q2hpbGRXb3JrZmxvd0V4ZWN1dGlvbk5leHRIYW5kbGVyXG4gICk7XG4gIGNvbnN0IFtzdGFydGVkLCBjb21wbGV0ZWRdID0gYXdhaXQgZXhlY3V0ZSh7XG4gICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuY2hpbGRXb3JrZmxvdysrLFxuICAgIG9wdGlvbnM6IG9wdGlvbnNXaXRoRGVmYXVsdHMsXG4gICAgaGVhZGVyczoge30sXG4gICAgd29ya2Zsb3dUeXBlLFxuICB9KTtcbiAgY29uc3QgZmlyc3RFeGVjdXRpb25SdW5JZCA9IGF3YWl0IHN0YXJ0ZWQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3b3JrZmxvd0lkOiBvcHRpb25zV2l0aERlZmF1bHRzLndvcmtmbG93SWQsXG4gICAgZmlyc3RFeGVjdXRpb25SdW5JZCxcbiAgICBhc3luYyByZXN1bHQoKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgICAgIHJldHVybiAoYXdhaXQgY29tcGxldGVkKSBhcyBhbnk7XG4gICAgfSxcbiAgICBhc3luYyBzaWduYWw8QXJncyBleHRlbmRzIGFueVtdPihkZWY6IFNpZ25hbERlZmluaXRpb248QXJncz4gfCBzdHJpbmcsIC4uLmFyZ3M6IEFyZ3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgIHJldHVybiBjb21wb3NlSW50ZXJjZXB0b3JzKFxuICAgICAgICBhY3RpdmF0b3IuaW50ZXJjZXB0b3JzLm91dGJvdW5kLFxuICAgICAgICAnc2lnbmFsV29ya2Zsb3cnLFxuICAgICAgICBzaWduYWxXb3JrZmxvd05leHRIYW5kbGVyXG4gICAgICApKHtcbiAgICAgICAgc2VxOiBhY3RpdmF0b3IubmV4dFNlcXMuc2lnbmFsV29ya2Zsb3crKyxcbiAgICAgICAgc2lnbmFsTmFtZTogdHlwZW9mIGRlZiA9PT0gJ3N0cmluZycgPyBkZWYgOiBkZWYubmFtZSxcbiAgICAgICAgYXJncyxcbiAgICAgICAgdGFyZ2V0OiB7XG4gICAgICAgICAgdHlwZTogJ2NoaWxkJyxcbiAgICAgICAgICBjaGlsZFdvcmtmbG93SWQ6IG9wdGlvbnNXaXRoRGVmYXVsdHMud29ya2Zsb3dJZCxcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZGVyczoge30sXG4gICAgICB9KTtcbiAgICB9LFxuICB9O1xufVxuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyBXb3JrZmxvdz4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nLFxuICBvcHRpb25zOiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+O1xuXG4vKipcbiAqIFN0YXJ0IGEgY2hpbGQgV29ya2Zsb3cgZXhlY3V0aW9uIGFuZCBhd2FpdCBpdHMgY29tcGxldGlvbi5cbiAqXG4gKiAtIEJ5IGRlZmF1bHQsIGEgY2hpbGQgd2lsbCBiZSBzY2hlZHVsZWQgb24gdGhlIHNhbWUgdGFzayBxdWV1ZSBhcyBpdHMgcGFyZW50LlxuICogLSBEZWR1Y2VzIHRoZSBXb3JrZmxvdyB0eXBlIGFuZCBzaWduYXR1cmUgZnJvbSBwcm92aWRlZCBXb3JrZmxvdyBmdW5jdGlvbi5cbiAqIC0gVGhpcyBvcGVyYXRpb24gaXMgY2FuY2VsbGFibGUgdXNpbmcge0BsaW5rIENhbmNlbGxhdGlvblNjb3BlfXMuXG4gKlxuICogQHJldHVybiBUaGUgcmVzdWx0IG9mIHRoZSBjaGlsZCBXb3JrZmxvdy5cbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd0Z1bmM6IFQsXG4gIG9wdGlvbnM6IFdpdGhXb3JrZmxvd0FyZ3M8VCwgQ2hpbGRXb3JrZmxvd09wdGlvbnM+XG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIFRoaXMgb3BlcmF0aW9uIGlzIGNhbmNlbGxhYmxlIHVzaW5nIHtAbGluayBDYW5jZWxsYXRpb25TY29wZX1zLlxuICpcbiAqIEByZXR1cm4gVGhlIHJlc3VsdCBvZiB0aGUgY2hpbGQgV29ya2Zsb3cuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQ2hpbGQ8VCBleHRlbmRzICgpID0+IFdvcmtmbG93UmV0dXJuVHlwZT4oXG4gIHdvcmtmbG93VHlwZTogc3RyaW5nXG4pOiBQcm9taXNlPFdvcmtmbG93UmVzdWx0VHlwZTxUPj47XG5cbi8qKlxuICogU3RhcnQgYSBjaGlsZCBXb3JrZmxvdyBleGVjdXRpb24gYW5kIGF3YWl0IGl0cyBjb21wbGV0aW9uLlxuICpcbiAqICoqT3ZlcnJpZGUgZm9yIFdvcmtmbG93cyB0aGF0IGFjY2VwdCBubyBhcmd1bWVudHMqKi5cbiAqXG4gKiAtIFRoZSBjaGlsZCB3aWxsIGJlIHNjaGVkdWxlZCBvbiB0aGUgc2FtZSB0YXNrIHF1ZXVlIGFzIGl0cyBwYXJlbnQuXG4gKiAtIERlZHVjZXMgdGhlIFdvcmtmbG93IHR5cGUgYW5kIHNpZ25hdHVyZSBmcm9tIHByb3ZpZGVkIFdvcmtmbG93IGZ1bmN0aW9uLlxuICogLSBUaGlzIG9wZXJhdGlvbiBpcyBjYW5jZWxsYWJsZSB1c2luZyB7QGxpbmsgQ2FuY2VsbGF0aW9uU2NvcGV9cy5cbiAqXG4gKiBAcmV0dXJuIFRoZSByZXN1bHQgb2YgdGhlIGNoaWxkIFdvcmtmbG93LlxuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUNoaWxkPFQgZXh0ZW5kcyAoKSA9PiBXb3JrZmxvd1JldHVyblR5cGU+KHdvcmtmbG93RnVuYzogVCk6IFByb21pc2U8V29ya2Zsb3dSZXN1bHRUeXBlPFQ+PjtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVDaGlsZDxUIGV4dGVuZHMgV29ya2Zsb3c+KFxuICB3b3JrZmxvd1R5cGVPckZ1bmM6IHN0cmluZyB8IFQsXG4gIG9wdGlvbnM/OiBXaXRoV29ya2Zsb3dBcmdzPFQsIENoaWxkV29ya2Zsb3dPcHRpb25zPlxuKTogUHJvbWlzZTxXb3JrZmxvd1Jlc3VsdFR5cGU8VD4+IHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LmV4ZWN1dGVDaGlsZCguLi4pIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4gQ29uc2lkZXIgdXNpbmcgQ2xpZW50LndvcmtmbG93LmV4ZWN1dGUoLi4uKSBpbnN0ZWFkLidcbiAgKTtcbiAgY29uc3Qgb3B0aW9uc1dpdGhEZWZhdWx0cyA9IGFkZERlZmF1bHRXb3JrZmxvd09wdGlvbnMob3B0aW9ucyA/PyAoe30gYXMgYW55KSk7XG4gIGNvbnN0IHdvcmtmbG93VHlwZSA9IGV4dHJhY3RXb3JrZmxvd1R5cGUod29ya2Zsb3dUeXBlT3JGdW5jKTtcbiAgY29uc3QgZXhlY3V0ZSA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoXG4gICAgYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCxcbiAgICAnc3RhcnRDaGlsZFdvcmtmbG93RXhlY3V0aW9uJyxcbiAgICBzdGFydENoaWxkV29ya2Zsb3dFeGVjdXRpb25OZXh0SGFuZGxlclxuICApO1xuICBjb25zdCBleGVjUHJvbWlzZSA9IGV4ZWN1dGUoe1xuICAgIHNlcTogYWN0aXZhdG9yLm5leHRTZXFzLmNoaWxkV29ya2Zsb3crKyxcbiAgICBvcHRpb25zOiBvcHRpb25zV2l0aERlZmF1bHRzLFxuICAgIGhlYWRlcnM6IHt9LFxuICAgIHdvcmtmbG93VHlwZSxcbiAgfSk7XG4gIHVudHJhY2tQcm9taXNlKGV4ZWNQcm9taXNlKTtcbiAgY29uc3QgY29tcGxldGVkUHJvbWlzZSA9IGV4ZWNQcm9taXNlLnRoZW4oKFtfc3RhcnRlZCwgY29tcGxldGVkXSkgPT4gY29tcGxldGVkKTtcbiAgdW50cmFja1Byb21pc2UoY29tcGxldGVkUHJvbWlzZSk7XG4gIHJldHVybiBjb21wbGV0ZWRQcm9taXNlIGFzIFByb21pc2U8YW55Pjtcbn1cblxuLyoqXG4gKiBHZXQgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGN1cnJlbnQgV29ya2Zsb3cuXG4gKlxuICogV0FSTklORzogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgZnJvemVuIGNvcHkgb2YgV29ya2Zsb3dJbmZvLCBhdCB0aGUgcG9pbnQgd2hlcmUgdGhpcyBtZXRob2QgaGFzIGJlZW4gY2FsbGVkLlxuICogQ2hhbmdlcyBoYXBwZW5pbmcgYXQgbGF0ZXIgcG9pbnQgaW4gd29ya2Zsb3cgZXhlY3V0aW9uIHdpbGwgbm90IGJlIHJlZmxlY3RlZCBpbiB0aGUgcmV0dXJuZWQgb2JqZWN0LlxuICpcbiAqIEZvciB0aGlzIHJlYXNvbiwgd2UgcmVjb21tZW5kIGNhbGxpbmcgYHdvcmtmbG93SW5mbygpYCBvbiBldmVyeSBhY2Nlc3MgdG8ge0BsaW5rIFdvcmtmbG93SW5mb30ncyBmaWVsZHMsXG4gKiByYXRoZXIgdGhhbiBjYWNoaW5nIHRoZSBgV29ya2Zsb3dJbmZvYCBvYmplY3QgKG9yIHBhcnQgb2YgaXQpIGluIGEgbG9jYWwgdmFyaWFibGUuIEZvciBleGFtcGxlOlxuICpcbiAqIGBgYHRzXG4gKiAvLyBHT09EXG4gKiBmdW5jdGlvbiBteVdvcmtmbG93KCkge1xuICogICBkb1NvbWV0aGluZyh3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzKVxuICogICAuLi5cbiAqICAgZG9Tb21ldGhpbmdFbHNlKHdvcmtmbG93SW5mbygpLnNlYXJjaEF0dHJpYnV0ZXMpXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiB2c1xuICpcbiAqIGBgYHRzXG4gKiAvLyBCQURcbiAqIGZ1bmN0aW9uIG15V29ya2Zsb3coKSB7XG4gKiAgIGNvbnN0IGF0dHJpYnV0ZXMgPSB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzXG4gKiAgIGRvU29tZXRoaW5nKGF0dHJpYnV0ZXMpXG4gKiAgIC4uLlxuICogICBkb1NvbWV0aGluZ0Vsc2UoYXR0cmlidXRlcylcbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gd29ya2Zsb3dJbmZvKCk6IFdvcmtmbG93SW5mbyB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy53b3JrZmxvd0luZm8oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIHJldHVybiBhY3RpdmF0b3IuaW5mbztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IGNvZGUgaXMgZXhlY3V0aW5nIGluIHdvcmtmbG93IGNvbnRleHRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGluV29ya2Zsb3dDb250ZXh0KCk6IGJvb2xlYW4ge1xuICByZXR1cm4gbWF5YmVHZXRBY3RpdmF0b3IoKSAhPT0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBmdW5jdGlvbiBgZmAgdGhhdCB3aWxsIGNhdXNlIHRoZSBjdXJyZW50IFdvcmtmbG93IHRvIENvbnRpbnVlQXNOZXcgd2hlbiBjYWxsZWQuXG4gKlxuICogYGZgIHRha2VzIHRoZSBzYW1lIGFyZ3VtZW50cyBhcyB0aGUgV29ya2Zsb3cgZnVuY3Rpb24gc3VwcGxpZWQgdG8gdHlwZXBhcmFtIGBGYC5cbiAqXG4gKiBPbmNlIGBmYCBpcyBjYWxsZWQsIFdvcmtmbG93IEV4ZWN1dGlvbiBpbW1lZGlhdGVseSBjb21wbGV0ZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYWtlQ29udGludWVBc05ld0Z1bmM8RiBleHRlbmRzIFdvcmtmbG93PihcbiAgb3B0aW9ucz86IENvbnRpbnVlQXNOZXdPcHRpb25zXG4pOiAoLi4uYXJnczogUGFyYW1ldGVyczxGPikgPT4gUHJvbWlzZTxuZXZlcj4ge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuY29udGludWVBc05ldyguLi4pIGFuZCBXb3JrZmxvdy5tYWtlQ29udGludWVBc05ld0Z1bmMoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBjb25zdCBpbmZvID0gYWN0aXZhdG9yLmluZm87XG4gIGNvbnN0IHsgd29ya2Zsb3dUeXBlLCB0YXNrUXVldWUsIC4uLnJlc3QgfSA9IG9wdGlvbnMgPz8ge307XG4gIGNvbnN0IHJlcXVpcmVkT3B0aW9ucyA9IHtcbiAgICB3b3JrZmxvd1R5cGU6IHdvcmtmbG93VHlwZSA/PyBpbmZvLndvcmtmbG93VHlwZSxcbiAgICB0YXNrUXVldWU6IHRhc2tRdWV1ZSA/PyBpbmZvLnRhc2tRdWV1ZSxcbiAgICAuLi5yZXN0LFxuICB9O1xuXG4gIHJldHVybiAoLi4uYXJnczogUGFyYW1ldGVyczxGPik6IFByb21pc2U8bmV2ZXI+ID0+IHtcbiAgICBjb25zdCBmbiA9IGNvbXBvc2VJbnRlcmNlcHRvcnMoYWN0aXZhdG9yLmludGVyY2VwdG9ycy5vdXRib3VuZCwgJ2NvbnRpbnVlQXNOZXcnLCBhc3luYyAoaW5wdXQpID0+IHtcbiAgICAgIGNvbnN0IHsgaGVhZGVycywgYXJncywgb3B0aW9ucyB9ID0gaW5wdXQ7XG4gICAgICB0aHJvdyBuZXcgQ29udGludWVBc05ldyh7XG4gICAgICAgIHdvcmtmbG93VHlwZTogb3B0aW9ucy53b3JrZmxvd1R5cGUsXG4gICAgICAgIGFyZ3VtZW50czogdG9QYXlsb2FkcyhhY3RpdmF0b3IucGF5bG9hZENvbnZlcnRlciwgLi4uYXJncyksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHRhc2tRdWV1ZTogb3B0aW9ucy50YXNrUXVldWUsXG4gICAgICAgIG1lbW86IG9wdGlvbnMubWVtbyAmJiBtYXBUb1BheWxvYWRzKGFjdGl2YXRvci5wYXlsb2FkQ29udmVydGVyLCBvcHRpb25zLm1lbW8pLFxuICAgICAgICBzZWFyY2hBdHRyaWJ1dGVzOiBvcHRpb25zLnNlYXJjaEF0dHJpYnV0ZXNcbiAgICAgICAgICA/IG1hcFRvUGF5bG9hZHMoc2VhcmNoQXR0cmlidXRlUGF5bG9hZENvbnZlcnRlciwgb3B0aW9ucy5zZWFyY2hBdHRyaWJ1dGVzKVxuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICB3b3JrZmxvd1J1blRpbWVvdXQ6IG1zT3B0aW9uYWxUb1RzKG9wdGlvbnMud29ya2Zsb3dSdW5UaW1lb3V0KSxcbiAgICAgICAgd29ya2Zsb3dUYXNrVGltZW91dDogbXNPcHRpb25hbFRvVHMob3B0aW9ucy53b3JrZmxvd1Rhc2tUaW1lb3V0KSxcbiAgICAgICAgdmVyc2lvbmluZ0ludGVudDogdmVyc2lvbmluZ0ludGVudFRvUHJvdG8ob3B0aW9ucy52ZXJzaW9uaW5nSW50ZW50KSxcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBmbih7XG4gICAgICBhcmdzLFxuICAgICAgaGVhZGVyczoge30sXG4gICAgICBvcHRpb25zOiByZXF1aXJlZE9wdGlvbnMsXG4gICAgfSk7XG4gIH07XG59XG5cbi8qKlxuICoge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby9jb25jZXB0cy93aGF0LWlzLWNvbnRpbnVlLWFzLW5ldy8gfCBDb250aW51ZXMtQXMtTmV3fSB0aGUgY3VycmVudCBXb3JrZmxvdyBFeGVjdXRpb25cbiAqIHdpdGggZGVmYXVsdCBvcHRpb25zLlxuICpcbiAqIFNob3J0aGFuZCBmb3IgYG1ha2VDb250aW51ZUFzTmV3RnVuYzxGPigpKC4uLmFyZ3MpYC4gKFNlZToge0BsaW5rIG1ha2VDb250aW51ZUFzTmV3RnVuY30uKVxuICpcbiAqIEBleGFtcGxlXG4gKlxuICpgYGB0c1xuICppbXBvcnQgeyBjb250aW51ZUFzTmV3IH0gZnJvbSAnQHRlbXBvcmFsaW8vd29ya2Zsb3cnO1xuICpcbiAqZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG15V29ya2Zsb3cobjogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiB7XG4gKiAgLy8gLi4uIFdvcmtmbG93IGxvZ2ljXG4gKiAgYXdhaXQgY29udGludWVBc05ldzx0eXBlb2YgbXlXb3JrZmxvdz4obiArIDEpO1xuICp9XG4gKmBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29udGludWVBc05ldzxGIGV4dGVuZHMgV29ya2Zsb3c+KC4uLmFyZ3M6IFBhcmFtZXRlcnM8Rj4pOiBQcm9taXNlPG5ldmVyPiB7XG4gIHJldHVybiBtYWtlQ29udGludWVBc05ld0Z1bmMoKSguLi5hcmdzKTtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZSBhbiBSRkMgY29tcGxpYW50IFY0IHV1aWQuXG4gKiBVc2VzIHRoZSB3b3JrZmxvdydzIGRldGVybWluaXN0aWMgUFJORyBtYWtpbmcgaXQgc2FmZSBmb3IgdXNlIHdpdGhpbiBhIHdvcmtmbG93LlxuICogVGhpcyBmdW5jdGlvbiBpcyBjcnlwdG9ncmFwaGljYWxseSBpbnNlY3VyZS5cbiAqIFNlZSB0aGUge0BsaW5rIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEwNTAzNC9ob3ctdG8tY3JlYXRlLWEtZ3VpZC11dWlkIHwgc3RhY2tvdmVyZmxvdyBkaXNjdXNzaW9ufS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHV1aWQ0KCk6IHN0cmluZyB7XG4gIC8vIFJldHVybiB0aGUgaGV4YWRlY2ltYWwgdGV4dCByZXByZXNlbnRhdGlvbiBvZiBudW1iZXIgYG5gLCBwYWRkZWQgd2l0aCB6ZXJvZXMgdG8gYmUgb2YgbGVuZ3RoIGBwYFxuICBjb25zdCBobyA9IChuOiBudW1iZXIsIHA6IG51bWJlcikgPT4gbi50b1N0cmluZygxNikucGFkU3RhcnQocCwgJzAnKTtcbiAgLy8gQ3JlYXRlIGEgdmlldyBiYWNrZWQgYnkgYSAxNi1ieXRlIGJ1ZmZlclxuICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KG5ldyBBcnJheUJ1ZmZlcigxNikpO1xuICAvLyBGaWxsIGJ1ZmZlciB3aXRoIHJhbmRvbSB2YWx1ZXNcbiAgdmlldy5zZXRVaW50MzIoMCwgKE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMCkgPj4+IDApO1xuICB2aWV3LnNldFVpbnQzMig0LCAoTWF0aC5yYW5kb20oKSAqIDB4MTAwMDAwMDAwKSA+Pj4gMCk7XG4gIHZpZXcuc2V0VWludDMyKDgsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgdmlldy5zZXRVaW50MzIoMTIsIChNYXRoLnJhbmRvbSgpICogMHgxMDAwMDAwMDApID4+PiAwKTtcbiAgLy8gUGF0Y2ggdGhlIDZ0aCBieXRlIHRvIHJlZmxlY3QgYSB2ZXJzaW9uIDQgVVVJRFxuICB2aWV3LnNldFVpbnQ4KDYsICh2aWV3LmdldFVpbnQ4KDYpICYgMHhmKSB8IDB4NDApO1xuICAvLyBQYXRjaCB0aGUgOHRoIGJ5dGUgdG8gcmVmbGVjdCBhIHZhcmlhbnQgMSBVVUlEICh2ZXJzaW9uIDQgVVVJRHMgYXJlKVxuICB2aWV3LnNldFVpbnQ4KDgsICh2aWV3LmdldFVpbnQ4KDgpICYgMHgzZikgfCAweDgwKTtcbiAgLy8gQ29tcGlsZSB0aGUgY2Fub25pY2FsIHRleHR1YWwgZm9ybSBmcm9tIHRoZSBhcnJheSBkYXRhXG4gIHJldHVybiBgJHtobyh2aWV3LmdldFVpbnQzMigwKSwgOCl9LSR7aG8odmlldy5nZXRVaW50MTYoNCksIDQpfS0ke2hvKHZpZXcuZ2V0VWludDE2KDYpLCA0KX0tJHtobyhcbiAgICB2aWV3LmdldFVpbnQxNig4KSxcbiAgICA0XG4gICl9LSR7aG8odmlldy5nZXRVaW50MzIoMTApLCA4KX0ke2hvKHZpZXcuZ2V0VWludDE2KDE0KSwgNCl9YDtcbn1cblxuLyoqXG4gKiBQYXRjaCBvciB1cGdyYWRlIHdvcmtmbG93IGNvZGUgYnkgY2hlY2tpbmcgb3Igc3RhdGluZyB0aGF0IHRoaXMgd29ya2Zsb3cgaGFzIGEgY2VydGFpbiBwYXRjaC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIElmIHRoZSB3b3JrZmxvdyBpcyByZXBsYXlpbmcgYW4gZXhpc3RpbmcgaGlzdG9yeSwgdGhlbiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgdHJ1ZSBpZiB0aGF0XG4gKiBoaXN0b3J5IHdhcyBwcm9kdWNlZCBieSBhIHdvcmtlciB3aGljaCBhbHNvIGhhZCBhIGBwYXRjaGVkYCBjYWxsIHdpdGggdGhlIHNhbWUgYHBhdGNoSWRgLlxuICogSWYgdGhlIGhpc3Rvcnkgd2FzIHByb2R1Y2VkIGJ5IGEgd29ya2VyICp3aXRob3V0KiBzdWNoIGEgY2FsbCwgdGhlbiBpdCB3aWxsIHJldHVybiBmYWxzZS5cbiAqXG4gKiBJZiB0aGUgd29ya2Zsb3cgaXMgbm90IGN1cnJlbnRseSByZXBsYXlpbmcsIHRoZW4gdGhpcyBjYWxsICphbHdheXMqIHJldHVybnMgdHJ1ZS5cbiAqXG4gKiBZb3VyIHdvcmtmbG93IGNvZGUgc2hvdWxkIHJ1biB0aGUgXCJuZXdcIiBjb2RlIGlmIHRoaXMgcmV0dXJucyB0cnVlLCBpZiBpdCByZXR1cm5zIGZhbHNlLCB5b3VcbiAqIHNob3VsZCBydW4gdGhlIFwib2xkXCIgY29kZS4gQnkgZG9pbmcgdGhpcywgeW91IGNhbiBtYWludGFpbiBkZXRlcm1pbmlzbS5cbiAqXG4gKiBAcGFyYW0gcGF0Y2hJZCBBbiBpZGVudGlmaWVyIHRoYXQgc2hvdWxkIGJlIHVuaXF1ZSB0byB0aGlzIHBhdGNoLiBJdCBpcyBPSyB0byB1c2UgbXVsdGlwbGVcbiAqIGNhbGxzIHdpdGggdGhlIHNhbWUgSUQsIHdoaWNoIG1lYW5zIGFsbCBzdWNoIGNhbGxzIHdpbGwgYWx3YXlzIHJldHVybiB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhdGNoZWQocGF0Y2hJZDogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiBwYXRjaEludGVybmFsKHBhdGNoSWQsIGZhbHNlKTtcbn1cblxuLyoqXG4gKiBJbmRpY2F0ZSB0aGF0IGEgcGF0Y2ggaXMgYmVpbmcgcGhhc2VkIG91dC5cbiAqXG4gKiBTZWUge0BsaW5rIGh0dHBzOi8vZG9jcy50ZW1wb3JhbC5pby90eXBlc2NyaXB0L3ZlcnNpb25pbmcgfCBkb2NzIHBhZ2V9IGZvciBpbmZvLlxuICpcbiAqIFdvcmtmbG93cyB3aXRoIHRoaXMgY2FsbCBtYXkgYmUgZGVwbG95ZWQgYWxvbmdzaWRlIHdvcmtmbG93cyB3aXRoIGEge0BsaW5rIHBhdGNoZWR9IGNhbGwsIGJ1dFxuICogdGhleSBtdXN0ICpub3QqIGJlIGRlcGxveWVkIHdoaWxlIGFueSB3b3JrZXJzIHN0aWxsIGV4aXN0IHJ1bm5pbmcgb2xkIGNvZGUgd2l0aG91dCBhXG4gKiB7QGxpbmsgcGF0Y2hlZH0gY2FsbCwgb3IgYW55IHJ1bnMgd2l0aCBoaXN0b3JpZXMgcHJvZHVjZWQgYnkgc3VjaCB3b3JrZXJzIGV4aXN0LiBJZiBlaXRoZXIga2luZFxuICogb2Ygd29ya2VyIGVuY291bnRlcnMgYSBoaXN0b3J5IHByb2R1Y2VkIGJ5IHRoZSBvdGhlciwgdGhlaXIgYmVoYXZpb3IgaXMgdW5kZWZpbmVkLlxuICpcbiAqIE9uY2UgYWxsIGxpdmUgd29ya2Zsb3cgcnVucyBoYXZlIGJlZW4gcHJvZHVjZWQgYnkgd29ya2VycyB3aXRoIHRoaXMgY2FsbCwgeW91IGNhbiBkZXBsb3kgd29ya2Vyc1xuICogd2hpY2ggYXJlIGZyZWUgb2YgZWl0aGVyIGtpbmQgb2YgcGF0Y2ggY2FsbCBmb3IgdGhpcyBJRC4gV29ya2VycyB3aXRoIGFuZCB3aXRob3V0IHRoaXMgY2FsbFxuICogbWF5IGNvZXhpc3QsIGFzIGxvbmcgYXMgdGhleSBhcmUgYm90aCBydW5uaW5nIHRoZSBcIm5ld1wiIGNvZGUuXG4gKlxuICogQHBhcmFtIHBhdGNoSWQgQW4gaWRlbnRpZmllciB0aGF0IHNob3VsZCBiZSB1bmlxdWUgdG8gdGhpcyBwYXRjaC4gSXQgaXMgT0sgdG8gdXNlIG11bHRpcGxlXG4gKiBjYWxscyB3aXRoIHRoZSBzYW1lIElELCB3aGljaCBtZWFucyBhbGwgc3VjaCBjYWxscyB3aWxsIGFsd2F5cyByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXByZWNhdGVQYXRjaChwYXRjaElkOiBzdHJpbmcpOiB2b2lkIHtcbiAgcGF0Y2hJbnRlcm5hbChwYXRjaElkLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gcGF0Y2hJbnRlcm5hbChwYXRjaElkOiBzdHJpbmcsIGRlcHJlY2F0ZWQ6IGJvb2xlYW4pOiBib29sZWFuIHtcbiAgY29uc3QgYWN0aXZhdG9yID0gYXNzZXJ0SW5Xb3JrZmxvd0NvbnRleHQoXG4gICAgJ1dvcmtmbG93LnBhdGNoKC4uLikgYW5kIFdvcmtmbG93LmRlcHJlY2F0ZVBhdGNoIG1heSBvbmx5IGJlIHVzZWQgZnJvbSBhIFdvcmtmbG93IEV4ZWN1dGlvbi4nXG4gICk7XG4gIC8vIFBhdGNoIG9wZXJhdGlvbiBkb2VzIG5vdCBzdXBwb3J0IGludGVyY2VwdGlvbiBhdCB0aGUgbW9tZW50LCBpZiBpdCBkaWQsXG4gIC8vIHRoaXMgd291bGQgYmUgdGhlIHBsYWNlIHRvIHN0YXJ0IHRoZSBpbnRlcmNlcHRpb24gY2hhaW5cblxuICBpZiAoYWN0aXZhdG9yLndvcmtmbG93ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgSWxsZWdhbFN0YXRlRXJyb3IoJ1BhdGNoZXMgY2Fubm90IGJlIHVzZWQgYmVmb3JlIFdvcmtmbG93IHN0YXJ0cycpO1xuICB9XG4gIGNvbnN0IHVzZVBhdGNoID0gIWFjdGl2YXRvci5pbmZvLnVuc2FmZS5pc1JlcGxheWluZyB8fCBhY3RpdmF0b3Iua25vd25QcmVzZW50UGF0Y2hlcy5oYXMocGF0Y2hJZCk7XG4gIC8vIEF2b2lkIHNlbmRpbmcgY29tbWFuZHMgZm9yIHBhdGNoZXMgY29yZSBhbHJlYWR5IGtub3dzIGFib3V0LlxuICAvLyBUaGlzIG9wdGltaXphdGlvbiBlbmFibGVzIGRldmVsb3BtZW50IG9mIGF1dG9tYXRpYyBwYXRjaGluZyB0b29scy5cbiAgaWYgKHVzZVBhdGNoICYmICFhY3RpdmF0b3Iuc2VudFBhdGNoZXMuaGFzKHBhdGNoSWQpKSB7XG4gICAgYWN0aXZhdG9yLnB1c2hDb21tYW5kKHtcbiAgICAgIHNldFBhdGNoTWFya2VyOiB7IHBhdGNoSWQsIGRlcHJlY2F0ZWQgfSxcbiAgICB9KTtcbiAgICBhY3RpdmF0b3Iuc2VudFBhdGNoZXMuYWRkKHBhdGNoSWQpO1xuICB9XG4gIHJldHVybiB1c2VQYXRjaDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYGZuYCBldmFsdWF0ZXMgdG8gYHRydWVgIG9yIGB0aW1lb3V0YCBleHBpcmVzLlxuICpcbiAqIEBwYXJhbSB0aW1lb3V0IG51bWJlciBvZiBtaWxsaXNlY29uZHMgb3Ige0BsaW5rIGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL21zIHwgbXMtZm9ybWF0dGVkIHN0cmluZ31cbiAqXG4gKiBAcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBjb25kaXRpb24gd2FzIHRydWUgYmVmb3JlIHRoZSB0aW1lb3V0IGV4cGlyZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbmRpdGlvbihmbjogKCkgPT4gYm9vbGVhbiwgdGltZW91dDogRHVyYXRpb24pOiBQcm9taXNlPGJvb2xlYW4+O1xuXG4vKipcbiAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiBgZm5gIGV2YWx1YXRlcyB0byBgdHJ1ZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb24oZm46ICgpID0+IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+O1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY29uZGl0aW9uKGZuOiAoKSA9PiBib29sZWFuLCB0aW1lb3V0PzogRHVyYXRpb24pOiBQcm9taXNlPHZvaWQgfCBib29sZWFuPiB7XG4gIGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5jb25kaXRpb24oLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJyk7XG4gIC8vIFByaW9yIHRvIDEuNS4wLCBgY29uZGl0aW9uKGZuLCAwKWAgd2FzIHRyZWF0ZWQgYXMgZXF1aXZhbGVudCB0byBgY29uZGl0aW9uKGZuLCB1bmRlZmluZWQpYFxuICBpZiAodGltZW91dCA9PT0gMCAmJiAhcGF0Y2hlZChDT05ESVRJT05fMF9QQVRDSCkpIHtcbiAgICByZXR1cm4gY29uZGl0aW9uSW5uZXIoZm4pO1xuICB9XG4gIGlmICh0eXBlb2YgdGltZW91dCA9PT0gJ251bWJlcicgfHwgdHlwZW9mIHRpbWVvdXQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIENhbmNlbGxhdGlvblNjb3BlLmNhbmNlbGxhYmxlKGFzeW5jICgpID0+IHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhd2FpdCBQcm9taXNlLnJhY2UoW3NsZWVwKHRpbWVvdXQpLnRoZW4oKCkgPT4gZmFsc2UpLCBjb25kaXRpb25Jbm5lcihmbikudGhlbigoKSA9PiB0cnVlKV0pO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpLmNhbmNlbCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBjb25kaXRpb25Jbm5lcihmbik7XG59XG5cbmZ1bmN0aW9uIGNvbmRpdGlvbklubmVyKGZuOiAoKSA9PiBib29sZWFuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGdldEFjdGl2YXRvcigpO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IHNjb3BlID0gQ2FuY2VsbGF0aW9uU2NvcGUuY3VycmVudCgpO1xuICAgIGlmIChzY29wZS5jb25zaWRlcmVkQ2FuY2VsbGVkKSB7XG4gICAgICB1bnRyYWNrUHJvbWlzZShzY29wZS5jYW5jZWxSZXF1ZXN0ZWQuY2F0Y2gocmVqZWN0KSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgc2VxID0gYWN0aXZhdG9yLm5leHRTZXFzLmNvbmRpdGlvbisrO1xuICAgIGlmIChzY29wZS5jYW5jZWxsYWJsZSkge1xuICAgICAgdW50cmFja1Byb21pc2UoXG4gICAgICAgIHNjb3BlLmNhbmNlbFJlcXVlc3RlZC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgYWN0aXZhdG9yLmJsb2NrZWRDb25kaXRpb25zLmRlbGV0ZShzZXEpO1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBFYWdlciBldmFsdWF0aW9uXG4gICAgaWYgKGZuKCkpIHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBhY3RpdmF0b3IuYmxvY2tlZENvbmRpdGlvbnMuc2V0KHNlcSwgeyBmbiwgcmVzb2x2ZSB9KTtcbiAgfSk7XG59XG5cbi8qKlxuICogRGVmaW5lIGFuIHVwZGF0ZSBtZXRob2QgZm9yIGEgV29ya2Zsb3cuXG4gKlxuICogRGVmaW5pdGlvbnMgYXJlIHVzZWQgdG8gcmVnaXN0ZXIgaGFuZGxlciBpbiB0aGUgV29ya2Zsb3cgdmlhIHtAbGluayBzZXRIYW5kbGVyfSBhbmQgdG8gdXBkYXRlIFdvcmtmbG93cyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0sIHtAbGluayBDaGlsZFdvcmtmbG93SGFuZGxlfSBvciB7QGxpbmsgRXh0ZXJuYWxXb3JrZmxvd0hhbmRsZX0uXG4gKiBEZWZpbml0aW9ucyBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVVwZGF0ZTxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSA9IFtdLCBOYW1lIGV4dGVuZHMgc3RyaW5nID0gc3RyaW5nPihcbiAgbmFtZTogTmFtZVxuKTogVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAndXBkYXRlJyxcbiAgICBuYW1lLFxuICB9IGFzIFVwZGF0ZURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPjtcbn1cblxuLyoqXG4gKiBEZWZpbmUgYSBzaWduYWwgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIERlZmluaXRpb25zIGFyZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHNpZ25hbCBXb3JrZmxvd3MgdXNpbmcgYSB7QGxpbmsgV29ya2Zsb3dIYW5kbGV9LCB7QGxpbmsgQ2hpbGRXb3JrZmxvd0hhbmRsZX0gb3Ige0BsaW5rIEV4dGVybmFsV29ya2Zsb3dIYW5kbGV9LlxuICogRGVmaW5pdGlvbnMgY2FuIGJlIHJldXNlZCBpbiBtdWx0aXBsZSBXb3JrZmxvd3MuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWZpbmVTaWduYWw8QXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBTaWduYWxEZWZpbml0aW9uPEFyZ3MsIE5hbWU+IHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnc2lnbmFsJyxcbiAgICBuYW1lLFxuICB9IGFzIFNpZ25hbERlZmluaXRpb248QXJncywgTmFtZT47XG59XG5cbi8qKlxuICogRGVmaW5lIGEgcXVlcnkgbWV0aG9kIGZvciBhIFdvcmtmbG93LlxuICpcbiAqIERlZmluaXRpb25zIGFyZSB1c2VkIHRvIHJlZ2lzdGVyIGhhbmRsZXIgaW4gdGhlIFdvcmtmbG93IHZpYSB7QGxpbmsgc2V0SGFuZGxlcn0gYW5kIHRvIHF1ZXJ5IFdvcmtmbG93cyB1c2luZyBhIHtAbGluayBXb3JrZmxvd0hhbmRsZX0uXG4gKiBEZWZpbml0aW9ucyBjYW4gYmUgcmV1c2VkIGluIG11bHRpcGxlIFdvcmtmbG93cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRlZmluZVF1ZXJ5PFJldCwgQXJncyBleHRlbmRzIGFueVtdID0gW10sIE5hbWUgZXh0ZW5kcyBzdHJpbmcgPSBzdHJpbmc+KFxuICBuYW1lOiBOYW1lXG4pOiBRdWVyeURlZmluaXRpb248UmV0LCBBcmdzLCBOYW1lPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ3F1ZXJ5JyxcbiAgICBuYW1lLFxuICB9IGFzIFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3MsIE5hbWU+O1xufVxuXG4vKipcbiAqIFNldCBhIGhhbmRsZXIgZnVuY3Rpb24gZm9yIGEgV29ya2Zsb3cgdXBkYXRlLCBzaWduYWwsIG9yIHF1ZXJ5LlxuICpcbiAqIElmIHRoaXMgZnVuY3Rpb24gaXMgY2FsbGVkIG11bHRpcGxlIHRpbWVzIGZvciBhIGdpdmVuIHVwZGF0ZSwgc2lnbmFsLCBvciBxdWVyeSBuYW1lIHRoZSBsYXN0IGhhbmRsZXIgd2lsbCBvdmVyd3JpdGUgYW55IHByZXZpb3VzIGNhbGxzLlxuICpcbiAqIEBwYXJhbSBkZWYgYW4ge0BsaW5rIFVwZGF0ZURlZmluaXRpb259LCB7QGxpbmsgU2lnbmFsRGVmaW5pdGlvbn0sIG9yIHtAbGluayBRdWVyeURlZmluaXRpb259IGFzIHJldHVybmVkIGJ5IHtAbGluayBkZWZpbmVVcGRhdGV9LCB7QGxpbmsgZGVmaW5lU2lnbmFsfSwgb3Ige0BsaW5rIGRlZmluZVF1ZXJ5fSByZXNwZWN0aXZlbHkuXG4gKiBAcGFyYW0gaGFuZGxlciBhIGNvbXBhdGlibGUgaGFuZGxlciBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIGRlZmluaXRpb24gb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKiBAcGFyYW0gb3B0aW9ucyBhbiBvcHRpb25hbCBgZGVzY3JpcHRpb25gIG9mIHRoZSBoYW5kbGVyIGFuZCBhbiBvcHRpb25hbCB1cGRhdGUgYHZhbGlkYXRvcmAgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRIYW5kbGVyPFJldCwgQXJncyBleHRlbmRzIGFueVtdLCBUIGV4dGVuZHMgUXVlcnlEZWZpbml0aW9uPFJldCwgQXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFF1ZXJ5SGFuZGxlck9wdGlvbnNcbik6IHZvaWQ7XG5leHBvcnQgZnVuY3Rpb24gc2V0SGFuZGxlcjxSZXQsIEFyZ3MgZXh0ZW5kcyBhbnlbXSwgVCBleHRlbmRzIFNpZ25hbERlZmluaXRpb248QXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFNpZ25hbEhhbmRsZXJPcHRpb25zXG4pOiB2b2lkO1xuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8UmV0LCBBcmdzIGV4dGVuZHMgYW55W10sIFQgZXh0ZW5kcyBVcGRhdGVEZWZpbml0aW9uPFJldCwgQXJncz4+KFxuICBkZWY6IFQsXG4gIGhhbmRsZXI6IEhhbmRsZXI8UmV0LCBBcmdzLCBUPiB8IHVuZGVmaW5lZCxcbiAgb3B0aW9ucz86IFVwZGF0ZUhhbmRsZXJPcHRpb25zPEFyZ3M+XG4pOiB2b2lkO1xuXG4vLyBGb3IgVXBkYXRlcyBhbmQgU2lnbmFscyB3ZSB3YW50IHRvIG1ha2UgYSBwdWJsaWMgZ3VhcmFudGVlIHNvbWV0aGluZyBsaWtlIHRoZVxuLy8gZm9sbG93aW5nOlxuLy9cbi8vICAgXCJJZiBhIFdGVCBjb250YWlucyBhIFNpZ25hbC9VcGRhdGUsIGFuZCBpZiBhIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGZvciB0aGF0XG4vLyAgIFNpZ25hbC9VcGRhdGUsIHRoZW4gdGhlIGhhbmRsZXIgd2lsbCBiZSBleGVjdXRlZC5cIlwiXG4vL1xuLy8gSG93ZXZlciwgdGhhdCBzdGF0ZW1lbnQgaXMgbm90IHdlbGwtZGVmaW5lZCwgbGVhdmluZyBzZXZlcmFsIHF1ZXN0aW9ucyBvcGVuOlxuLy9cbi8vIDEuIFdoYXQgZG9lcyBpdCBtZWFuIGZvciBhIGhhbmRsZXIgdG8gYmUgXCJhdmFpbGFibGVcIj8gV2hhdCBoYXBwZW5zIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBub3QgcHJlc2VudCBpbml0aWFsbHkgYnV0IGlzIHNldCBhdCBzb21lIHBvaW50IGR1cmluZyB0aGVcbi8vICAgIFdvcmtmbG93IGNvZGUgdGhhdCBpcyBleGVjdXRlZCBpbiB0aGF0IFdGVD8gV2hhdCBoYXBwZW5zIGlmIHRoZSBoYW5kbGVyIGlzXG4vLyAgICBzZXQgYW5kIHRoZW4gZGVsZXRlZCwgb3IgcmVwbGFjZWQgd2l0aCBhIGRpZmZlcmVudCBoYW5kbGVyP1xuLy9cbi8vIDIuIFdoZW4gaXMgdGhlIGhhbmRsZXIgZXhlY3V0ZWQ/IChXaGVuIGl0IGZpcnN0IGJlY29tZXMgYXZhaWxhYmxlPyBBdCB0aGUgZW5kXG4vLyAgICBvZiB0aGUgYWN0aXZhdGlvbj8pIFdoYXQgYXJlIHRoZSBleGVjdXRpb24gc2VtYW50aWNzIG9mIFdvcmtmbG93IGFuZFxuLy8gICAgU2lnbmFsL1VwZGF0ZSBoYW5kbGVyIGNvZGUgZ2l2ZW4gdGhhdCB0aGV5IGFyZSBjb25jdXJyZW50PyBDYW4gdGhlIHVzZXJcbi8vICAgIHJlbHkgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIHRoZSBXb3JrZmxvdyByZXR1cm5cbi8vICAgIHZhbHVlLCBvciBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldz8gSWYgdGhlIGhhbmRsZXIgaXMgYW5cbi8vICAgIGFzeW5jIGZ1bmN0aW9uIC8gY29yb3V0aW5lLCBob3cgbXVjaCBvZiBpdCBpcyBleGVjdXRlZCBhbmQgd2hlbiBpcyB0aGVcbi8vICAgIHJlc3QgZXhlY3V0ZWQ/XG4vL1xuLy8gMy4gV2hhdCBoYXBwZW5zIGlmIHRoZSBoYW5kbGVyIGlzIG5vdCBleGVjdXRlZD8gKGkuZS4gYmVjYXVzZSBpdCB3YXNuJ3Rcbi8vICAgIGF2YWlsYWJsZSBpbiB0aGUgc2Vuc2UgZGVmaW5lZCBieSAoMSkpXG4vL1xuLy8gNC4gSW4gdGhlIGNhc2Ugb2YgVXBkYXRlLCB3aGVuIGlzIHRoZSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGV4ZWN1dGVkP1xuLy9cbi8vIFRoZSBpbXBsZW1lbnRhdGlvbiBmb3IgVHlwZXNjcmlwdCBpcyBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIHNkay1jb3JlIHNvcnRzIFNpZ25hbCBhbmQgVXBkYXRlIGpvYnMgKGFuZCBQYXRjaGVzKSBhaGVhZCBvZiBhbGwgb3RoZXJcbi8vICAgIGpvYnMuIFRodXMgaWYgdGhlIGhhbmRsZXIgaXMgYXZhaWxhYmxlIGF0IHRoZSBzdGFydCBvZiB0aGUgQWN0aXZhdGlvbiB0aGVuXG4vLyAgICB0aGUgU2lnbmFsL1VwZGF0ZSB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBXb3JrZmxvdyBjb2RlIGlzIGV4ZWN1dGVkLiBJZiBpdFxuLy8gICAgaXMgbm90LCB0aGVuIHRoZSBTaWduYWwvVXBkYXRlIGNhbGxzIGlzIHB1c2hlZCB0byBhIGJ1ZmZlci5cbi8vXG4vLyAyLiBPbiBlYWNoIGNhbGwgdG8gc2V0SGFuZGxlciBmb3IgYSBnaXZlbiBTaWduYWwvVXBkYXRlLCB3ZSBtYWtlIGEgcGFzc1xuLy8gICAgdGhyb3VnaCB0aGUgYnVmZmVyIGxpc3QuIElmIGEgYnVmZmVyZWQgam9iIGlzIGFzc29jaWF0ZWQgd2l0aCB0aGUganVzdC1zZXRcbi8vICAgIGhhbmRsZXIsIHRoZW4gdGhlIGpvYiBpcyByZW1vdmVkIGZyb20gdGhlIGJ1ZmZlciBhbmQgdGhlIGluaXRpYWxcbi8vICAgIHN5bmNocm9ub3VzIHBvcnRpb24gb2YgdGhlIGhhbmRsZXIgaXMgaW52b2tlZCBvbiB0aGF0IGlucHV0IChpLmUuXG4vLyAgICBwcmVlbXB0aW5nIHdvcmtmbG93IGNvZGUpLlxuLy9cbi8vIFRodXMgaW4gdGhlIGNhc2Ugb2YgVHlwZXNjcmlwdCB0aGUgcXVlc3Rpb25zIGFib3ZlIGFyZSBhbnN3ZXJlZCBhcyBmb2xsb3dzOlxuLy9cbi8vIDEuIEEgaGFuZGxlciBpcyBcImF2YWlsYWJsZVwiIGlmIGl0IGlzIHNldCBhdCB0aGUgc3RhcnQgb2YgdGhlIEFjdGl2YXRpb24gb3Jcbi8vICAgIGJlY29tZXMgc2V0IGF0IGFueSBwb2ludCBkdXJpbmcgdGhlIEFjdGl2YXRpb24uIElmIHRoZSBoYW5kbGVyIGlzIG5vdCBzZXRcbi8vICAgIGluaXRpYWxseSB0aGVuIGl0IGlzIGV4ZWN1dGVkIGFzIHNvb24gYXMgaXQgaXMgc2V0LiBTdWJzZXF1ZW50IGRlbGV0aW9uIG9yXG4vLyAgICByZXBsYWNlbWVudCBieSBhIGRpZmZlcmVudCBoYW5kbGVyIGhhcyBubyBpbXBhY3QgYmVjYXVzZSB0aGUgam9icyBpdCB3YXNcbi8vICAgIGhhbmRsaW5nIGhhdmUgYWxyZWFkeSBiZWVuIGhhbmRsZWQgYW5kIGFyZSBubyBsb25nZXIgaW4gdGhlIGJ1ZmZlci5cbi8vXG4vLyAyLiBUaGUgaGFuZGxlciBpcyBleGVjdXRlZCBhcyBzb29uIGFzIGl0IGJlY29tZXMgYXZhaWxhYmxlLiBJLmUuIGlmIHRoZVxuLy8gICAgaGFuZGxlciBpcyBzZXQgYXQgdGhlIHN0YXJ0IG9mIHRoZSBBY3RpdmF0aW9uIHRoZW4gaXQgaXMgZXhlY3V0ZWQgd2hlblxuLy8gICAgZmlyc3QgYXR0ZW1wdGluZyB0byBwcm9jZXNzIHRoZSBTaWduYWwvVXBkYXRlIGpvYjsgYWx0ZXJuYXRpdmVseSwgaWYgaXQgaXNcbi8vICAgIHNldCBieSBhIHNldEhhbmRsZXIgY2FsbCBtYWRlIGJ5IFdvcmtmbG93IGNvZGUsIHRoZW4gaXQgaXMgZXhlY3V0ZWQgYXNcbi8vICAgIHBhcnQgb2YgdGhhdCBjYWxsIChwcmVlbXB0aW5nIFdvcmtmbG93IGNvZGUpLiBUaGVyZWZvcmUsIGEgdXNlciBjYW4gcmVseVxuLy8gICAgb24gU2lnbmFsL1VwZGF0ZSBzaWRlIGVmZmVjdHMgYmVpbmcgcmVmbGVjdGVkIGluIGUuZy4gdGhlIFdvcmtmbG93IHJldHVyblxuLy8gICAgdmFsdWUsIGFuZCBpbiB0aGUgdmFsdWUgcGFzc2VkIHRvIENvbnRpbnVlLUFzLU5ldy4gQWN0aXZhdGlvbiBqb2JzIGFyZVxuLy8gICAgcHJvY2Vzc2VkIGluIHRoZSBvcmRlciBzdXBwbGllZCBieSBzZGstY29yZSwgaS5lLiBTaWduYWxzLCB0aGVuIFVwZGF0ZXMsXG4vLyAgICB0aGVuIG90aGVyIGpvYnMuIFdpdGhpbiBlYWNoIGdyb3VwLCB0aGUgb3JkZXIgc2VudCBieSB0aGUgc2VydmVyIGlzXG4vLyAgICBwcmVzZXJ2ZWQuIElmIHRoZSBoYW5kbGVyIGlzIGFzeW5jLCBpdCBpcyBleGVjdXRlZCB1cCB0byBpdHMgZmlyc3QgeWllbGRcbi8vICAgIHBvaW50LlxuLy9cbi8vIDMuIFNpZ25hbCBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYSBTaWduYWwgam9iIHRoZW5cbi8vICAgIHRoZSBqb2IgcmVtYWlucyBpbiB0aGUgYnVmZmVyLiBJZiBhIGhhbmRsZXIgZm9yIHRoZSBTaWduYWwgYmVjb21lc1xuLy8gICAgYXZhaWxhYmxlIGluIGEgc3Vic2VxdWVudCBBY3RpdmF0aW9uIChvZiB0aGUgc2FtZSBvciBhIHN1YnNlcXVlbnQgV0ZUKVxuLy8gICAgdGhlbiB0aGUgaGFuZGxlciB3aWxsIGJlIGV4ZWN1dGVkLiBJZiBub3QsIHRoZW4gdGhlIFNpZ25hbCB3aWxsIG5ldmVyIGJlXG4vLyAgICByZXNwb25kZWQgdG8gYW5kIHRoaXMgY2F1c2VzIG5vIGVycm9yLlxuLy9cbi8vICAgIFVwZGF0ZSBjYXNlOiBJZiBhIGhhbmRsZXIgZG9lcyBub3QgYmVjb21lIGF2YWlsYWJsZSBmb3IgYW4gVXBkYXRlIGpvYiB0aGVuXG4vLyAgICB0aGUgVXBkYXRlIGlzIHJlamVjdGVkIGF0IHRoZSBlbmQgb2YgdGhlIEFjdGl2YXRpb24uIFRodXMsIGlmIGEgdXNlciBkb2VzXG4vLyAgICBub3Qgd2FudCBhbiBVcGRhdGUgdG8gYmUgcmVqZWN0ZWQgZm9yIHRoaXMgcmVhc29uLCB0aGVuIGl0IGlzIHRoZWlyXG4vLyAgICByZXNwb25zaWJpbGl0eSB0byBlbnN1cmUgdGhhdCB0aGVpciBhcHBsaWNhdGlvbiBhbmQgd29ya2Zsb3cgY29kZSBpbnRlcmFjdFxuLy8gICAgc3VjaCB0aGF0IGEgaGFuZGxlciBpcyBhdmFpbGFibGUgZm9yIHRoZSBVcGRhdGUgZHVyaW5nIGFueSBBY3RpdmF0aW9uXG4vLyAgICB3aGljaCBtaWdodCBjb250YWluIHRoZWlyIFVwZGF0ZSBqb2IuIChOb3RlIHRoYXQgdGhlIHVzZXIgb2Z0ZW4gaGFzXG4vLyAgICB1bmNlcnRhaW50eSBhYm91dCB3aGljaCBXRlQgdGhlaXIgU2lnbmFsL1VwZGF0ZSB3aWxsIGFwcGVhciBpbi4gRm9yXG4vLyAgICBleGFtcGxlLCBpZiB0aGV5IGNhbGwgc3RhcnRXb3JrZmxvdygpIGZvbGxvd2VkIGJ5IHN0YXJ0VXBkYXRlKCksIHRoZW4gdGhleVxuLy8gICAgd2lsbCB0eXBpY2FsbHkgbm90IGtub3cgd2hldGhlciB0aGVzZSB3aWxsIGJlIGRlbGl2ZXJlZCBpbiBvbmUgb3IgdHdvXG4vLyAgICBXRlRzLiBPbiB0aGUgb3RoZXIgaGFuZCB0aGVyZSBhcmUgc2l0dWF0aW9ucyB3aGVyZSB0aGV5IHdvdWxkIGhhdmUgcmVhc29uXG4vLyAgICB0byBiZWxpZXZlIHRoZXkgYXJlIGluIHRoZSBzYW1lIFdGVCwgZm9yIGV4YW1wbGUgaWYgdGhleSBkbyBub3Qgc3RhcnRcbi8vICAgIFdvcmtlciBwb2xsaW5nIHVudGlsIGFmdGVyIHRoZXkgaGF2ZSB2ZXJpZmllZCB0aGF0IGJvdGggcmVxdWVzdHMgaGF2ZVxuLy8gICAgc3VjY2VlZGVkLilcbi8vXG4vLyA1LiBJZiBhbiBVcGRhdGUgaGFzIGEgdmFsaWRhdGlvbiBmdW5jdGlvbiB0aGVuIGl0IGlzIGV4ZWN1dGVkIGltbWVkaWF0ZWx5XG4vLyAgICBwcmlvciB0byB0aGUgaGFuZGxlci4gKE5vdGUgdGhhdCB0aGUgdmFsaWRhdGlvbiBmdW5jdGlvbiBpcyByZXF1aXJlZCB0byBiZVxuLy8gICAgc3luY2hyb25vdXMpLlxuZXhwb3J0IGZ1bmN0aW9uIHNldEhhbmRsZXI8XG4gIFJldCxcbiAgQXJncyBleHRlbmRzIGFueVtdLFxuICBUIGV4dGVuZHMgVXBkYXRlRGVmaW5pdGlvbjxSZXQsIEFyZ3M+IHwgU2lnbmFsRGVmaW5pdGlvbjxBcmdzPiB8IFF1ZXJ5RGVmaW5pdGlvbjxSZXQsIEFyZ3M+LFxuPihcbiAgZGVmOiBULFxuICBoYW5kbGVyOiBIYW5kbGVyPFJldCwgQXJncywgVD4gfCB1bmRlZmluZWQsXG4gIG9wdGlvbnM/OiBRdWVyeUhhbmRsZXJPcHRpb25zIHwgU2lnbmFsSGFuZGxlck9wdGlvbnMgfCBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPlxuKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KCdXb3JrZmxvdy5zZXRIYW5kbGVyKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLicpO1xuICBjb25zdCBkZXNjcmlwdGlvbiA9IG9wdGlvbnM/LmRlc2NyaXB0aW9uO1xuICBpZiAoZGVmLnR5cGUgPT09ICd1cGRhdGUnKSB7XG4gICAgaWYgKHR5cGVvZiBoYW5kbGVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjb25zdCB1cGRhdGVPcHRpb25zID0gb3B0aW9ucyBhcyBVcGRhdGVIYW5kbGVyT3B0aW9uczxBcmdzPiB8IHVuZGVmaW5lZDtcbiAgICAgIGNvbnN0IHZhbGlkYXRvciA9IHVwZGF0ZU9wdGlvbnM/LnZhbGlkYXRvciBhcyBXb3JrZmxvd1VwZGF0ZVZhbGlkYXRvclR5cGUgfCB1bmRlZmluZWQ7XG4gICAgICBhY3RpdmF0b3IudXBkYXRlSGFuZGxlcnMuc2V0KGRlZi5uYW1lLCB7IGhhbmRsZXIsIHZhbGlkYXRvciwgZGVzY3JpcHRpb24gfSk7XG4gICAgICBhY3RpdmF0b3IuZGlzcGF0Y2hCdWZmZXJlZFVwZGF0ZXMoKTtcbiAgICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgICAgYWN0aXZhdG9yLnVwZGF0ZUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIGlmIChkZWYudHlwZSA9PT0gJ3NpZ25hbCcpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5zZXQoZGVmLm5hbWUsIHsgaGFuZGxlcjogaGFuZGxlciBhcyBhbnksIGRlc2NyaXB0aW9uIH0pO1xuICAgICAgYWN0aXZhdG9yLmRpc3BhdGNoQnVmZmVyZWRTaWduYWxzKCk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5zaWduYWxIYW5kbGVycy5kZWxldGUoZGVmLm5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoZGVmLnR5cGUgPT09ICdxdWVyeScpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLnNldChkZWYubmFtZSwgeyBoYW5kbGVyOiBoYW5kbGVyIGFzIGFueSwgZGVzY3JpcHRpb24gfSk7XG4gICAgfSBlbHNlIGlmIChoYW5kbGVyID09IG51bGwpIHtcbiAgICAgIGFjdGl2YXRvci5xdWVyeUhhbmRsZXJzLmRlbGV0ZShkZWYubmFtZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGhhbmRsZXIgdG8gYmUgZWl0aGVyIGEgZnVuY3Rpb24gb3IgJ3VuZGVmaW5lZCcuIEdvdDogJyR7dHlwZW9mIGhhbmRsZXJ9J2ApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGRlZmluaXRpb24gdHlwZTogJHsoZGVmIGFzIGFueSkudHlwZX1gKTtcbiAgfVxufVxuXG4vKipcbiAqIFNldCBhIHNpZ25hbCBoYW5kbGVyIGZ1bmN0aW9uIHRoYXQgd2lsbCBoYW5kbGUgc2lnbmFscyBjYWxscyBmb3Igbm9uLXJlZ2lzdGVyZWQgc2lnbmFsIG5hbWVzLlxuICpcbiAqIFNpZ25hbHMgYXJlIGRpc3BhdGNoZWQgdG8gdGhlIGRlZmF1bHQgc2lnbmFsIGhhbmRsZXIgaW4gdGhlIG9yZGVyIHRoYXQgdGhleSB3ZXJlIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gKlxuICogSWYgdGhpcyBmdW5jdGlvbiBpcyBjYWxsZWQgbXVsdGlwbGUgdGltZXMgZm9yIGEgZ2l2ZW4gc2lnbmFsIG9yIHF1ZXJ5IG5hbWUgdGhlIGxhc3QgaGFuZGxlciB3aWxsIG92ZXJ3cml0ZSBhbnkgcHJldmlvdXMgY2FsbHMuXG4gKlxuICogQHBhcmFtIGhhbmRsZXIgYSBmdW5jdGlvbiB0aGF0IHdpbGwgaGFuZGxlIHNpZ25hbHMgZm9yIG5vbi1yZWdpc3RlcmVkIHNpZ25hbCBuYW1lcywgb3IgYHVuZGVmaW5lZGAgdG8gdW5zZXQgdGhlIGhhbmRsZXIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXREZWZhdWx0U2lnbmFsSGFuZGxlcihoYW5kbGVyOiBEZWZhdWx0U2lnbmFsSGFuZGxlciB8IHVuZGVmaW5lZCk6IHZvaWQge1xuICBjb25zdCBhY3RpdmF0b3IgPSBhc3NlcnRJbldvcmtmbG93Q29udGV4dChcbiAgICAnV29ya2Zsb3cuc2V0RGVmYXVsdFNpZ25hbEhhbmRsZXIoLi4uKSBtYXkgb25seSBiZSB1c2VkIGZyb20gYSBXb3JrZmxvdyBFeGVjdXRpb24uJ1xuICApO1xuICBpZiAodHlwZW9mIGhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhY3RpdmF0b3IuZGVmYXVsdFNpZ25hbEhhbmRsZXIgPSBoYW5kbGVyO1xuICAgIGFjdGl2YXRvci5kaXNwYXRjaEJ1ZmZlcmVkU2lnbmFscygpO1xuICB9IGVsc2UgaWYgKGhhbmRsZXIgPT0gbnVsbCkge1xuICAgIGFjdGl2YXRvci5kZWZhdWx0U2lnbmFsSGFuZGxlciA9IHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBoYW5kbGVyIHRvIGJlIGVpdGhlciBhIGZ1bmN0aW9uIG9yICd1bmRlZmluZWQnLiBHb3Q6ICcke3R5cGVvZiBoYW5kbGVyfSdgKTtcbiAgfVxufVxuXG4vKipcbiAqIFVwZGF0ZXMgdGhpcyBXb3JrZmxvdydzIFNlYXJjaCBBdHRyaWJ1dGVzIGJ5IG1lcmdpbmcgdGhlIHByb3ZpZGVkIGBzZWFyY2hBdHRyaWJ1dGVzYCB3aXRoIHRoZSBleGlzdGluZyBTZWFyY2hcbiAqIEF0dHJpYnV0ZXMsIGB3b3JrZmxvd0luZm8oKS5zZWFyY2hBdHRyaWJ1dGVzYC5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgdGhpcyBXb3JrZmxvdyBjb2RlOlxuICpcbiAqIGBgYHRzXG4gKiB1cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFsxXSxcbiAqICAgQ3VzdG9tQm9vbEZpZWxkOiBbdHJ1ZV1cbiAqIH0pO1xuICogdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyh7XG4gKiAgIEN1c3RvbUludEZpZWxkOiBbNDJdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH0pO1xuICogYGBgXG4gKlxuICogd291bGQgcmVzdWx0IGluIHRoZSBXb3JrZmxvdyBoYXZpbmcgdGhlc2UgU2VhcmNoIEF0dHJpYnV0ZXM6XG4gKlxuICogYGBgdHNcbiAqIHtcbiAqICAgQ3VzdG9tSW50RmllbGQ6IFs0Ml0sXG4gKiAgIEN1c3RvbUJvb2xGaWVsZDogW3RydWVdLFxuICogICBDdXN0b21LZXl3b3JkRmllbGQ6IFsnZHVyYWJsZSBjb2RlJywgJ2lzIGdyZWF0J11cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEBwYXJhbSBzZWFyY2hBdHRyaWJ1dGVzIFRoZSBSZWNvcmQgdG8gbWVyZ2UuIFVzZSBhIHZhbHVlIG9mIGBbXWAgdG8gY2xlYXIgYSBTZWFyY2ggQXR0cmlidXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBzZXJ0U2VhcmNoQXR0cmlidXRlcyhzZWFyY2hBdHRyaWJ1dGVzOiBTZWFyY2hBdHRyaWJ1dGVzKTogdm9pZCB7XG4gIGNvbnN0IGFjdGl2YXRvciA9IGFzc2VydEluV29ya2Zsb3dDb250ZXh0KFxuICAgICdXb3JrZmxvdy51cHNlcnRTZWFyY2hBdHRyaWJ1dGVzKC4uLikgbWF5IG9ubHkgYmUgdXNlZCBmcm9tIGEgV29ya2Zsb3cgRXhlY3V0aW9uLidcbiAgKTtcblxuICBpZiAoc2VhcmNoQXR0cmlidXRlcyA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZWFyY2hBdHRyaWJ1dGVzIG11c3QgYmUgYSBub24tbnVsbCBTZWFyY2hBdHRyaWJ1dGVzJyk7XG4gIH1cblxuICBhY3RpdmF0b3IucHVzaENvbW1hbmQoe1xuICAgIHVwc2VydFdvcmtmbG93U2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgc2VhcmNoQXR0cmlidXRlczogbWFwVG9QYXlsb2FkcyhzZWFyY2hBdHRyaWJ1dGVQYXlsb2FkQ29udmVydGVyLCBzZWFyY2hBdHRyaWJ1dGVzKSxcbiAgICB9LFxuICB9KTtcblxuICBhY3RpdmF0b3IubXV0YXRlV29ya2Zsb3dJbmZvKChpbmZvOiBXb3JrZmxvd0luZm8pOiBXb3JrZmxvd0luZm8gPT4ge1xuICAgIHJldHVybiB7XG4gICAgICAuLi5pbmZvLFxuICAgICAgc2VhcmNoQXR0cmlidXRlczoge1xuICAgICAgICAuLi5pbmZvLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICAgIC4uLnNlYXJjaEF0dHJpYnV0ZXMsXG4gICAgICB9LFxuICAgIH07XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3Qgc3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8c3RyaW5nPignX19zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IGVuaGFuY2VkU3RhY2tUcmFjZVF1ZXJ5ID0gZGVmaW5lUXVlcnk8RW5oYW5jZWRTdGFja1RyYWNlPignX19lbmhhbmNlZF9zdGFja190cmFjZScpO1xuZXhwb3J0IGNvbnN0IHdvcmtmbG93TWV0YWRhdGFRdWVyeSA9IGRlZmluZVF1ZXJ5PHRlbXBvcmFsLmFwaS5zZGsudjEuSVdvcmtmbG93TWV0YWRhdGE+KCdfX3RlbXBvcmFsX3dvcmtmbG93X21ldGFkYXRhJyk7XG4iLCJpbXBvcnQgeyBwcm94eUFjdGl2aXRpZXMgfSBmcm9tIFwiQHRlbXBvcmFsaW8vd29ya2Zsb3dcIjtcbmltcG9ydCB0eXBlIHsgY3JlYXRlUmViYWxhbmNlQWN0aXZpdGllc1dpdGhEZXBlbmRlbmNpZXMgfSBmcm9tIFwiLi9hY3Rpdml0aWVzXCI7XG5pbXBvcnQgeyBDb250ZXh0IH0gZnJvbSBcIkB0ZW1wb3JhbGlvL2FjdGl2aXR5XCI7XG5pbXBvcnQgKiBhcyB3ZiBmcm9tIFwiQHRlbXBvcmFsaW8vd29ya2Zsb3dcIjtcbmltcG9ydCB7IFJlYmFsYW5jZUVudHJ5SW5pdEFyZ3MgfSBmcm9tIFwiLi9leGFtcGxlcy93b3JrZmxvdy11dGlsc1wiO1xuXG5jb25zdCBhY3Rpdml0eUluaXRpYWxSZXRyeUludGVydmFsID0gMTAwMDtcbi8vIEluc3RhbnRpYXRlIHRoZSBhY3Rpdml0aWVzXG5jb25zdCB7IGdyZWV0LCBkb1BsYW5uZWRUeFN0ZXAsIG1pbnRUZXN0TmZ0LCBleGVjdXRlU3RyYXRlZ3kgfSA9XG4gIHByb3h5QWN0aXZpdGllczxSZXR1cm5UeXBlPHR5cGVvZiBjcmVhdGVSZWJhbGFuY2VBY3Rpdml0aWVzV2l0aERlcGVuZGVuY2llcz4+KFxuICAgIHtcbiAgICAgIHN0YXJ0VG9DbG9zZVRpbWVvdXQ6IFwiMSBob3VyXCIsXG4gICAgICBoZWFydGJlYXRUaW1lb3V0OiBcIjIgbWludXRlc1wiLFxuICAgICAgcmV0cnk6IHtcbiAgICAgICAgLy8gZGVmYXVsdCByZXRyeSBwb2xpY3kgaWYgbm90IHNwZWNpZmllZFxuICAgICAgICBpbml0aWFsSW50ZXJ2YWw6IFwiNjBzXCIsXG4gICAgICAgIGJhY2tvZmZDb2VmZmljaWVudDogMixcbiAgICAgICAgbWF4aW11bUF0dGVtcHRzOiAxLCAvL0luZmluaXR5LFxuICAgICAgICBtYXhpbXVtSW50ZXJ2YWw6IDEwMCAqIGFjdGl2aXR5SW5pdGlhbFJldHJ5SW50ZXJ2YWwsXG4gICAgICAgIG5vblJldHJ5YWJsZUVycm9yVHlwZXM6IFtdLFxuICAgICAgfSxcbiAgICB9XG4gICk7XG5cbi8vIENvbXBvc2Ugd29ya2Zsb3cgd2l0aCBhY3Rpdml0aWVzXG5leHBvcnQgY29uc3QgcmViYWxhbmNlV29ya2Zsb3cgPSBhc3luYyAoXG4gIHJlYmFsYW5jZUFyZ3M6IFJlYmFsYW5jZUVudHJ5SW5pdEFyZ3NcbikgPT4ge1xuICAvLyBmb3IgdGhpcyBleGVyY2lzZSwgbGV0cyBqdXN0IHN3YXAgMSBVU0RDIHRvIDEgREFJIGV2ZXJ5IGhvdXIuXG4gIGNvbnNvbGUubG9nKFwidGVtcG9yYWwgd29ya2VyOiBydW5uaW5nIHJlYmFsYW5jZSB3b3JrZmxvdyBbc3RhcnRdXCIpO1xuICAvLyBjb25zdCB0eFN0ZXBzID0gcmViYWxhbmNlQXJncy5wbGFubmVkVHJhbnNhY3Rpb25TdGVwc1xuXG4gIC8vIGNvbnN0IG1pbnRSZXMgPSBhd2FpdCBtaW50VGVzdE5mdChyZWJhbGFuY2VBcmdzLnN0cmF0ZWd5SW5zdGFuY2VJZCk7XG5cbiAgY29uc3Qgc3dhcFJlcyA9IGF3YWl0IGV4ZWN1dGVTdHJhdGVneShyZWJhbGFuY2VBcmdzLnN0cmF0ZWd5SW5zdGFuY2VJZCk7XG5cbiAgY29uc29sZS5sb2coXCJUZW1wb3JhbCB3b3JrZXI6IHN3YXAgcmVzdWx0XCIsIHN3YXBSZXMpO1xuICAvLyBmb3IgKGxldCBwcm9ncmVzcyA9IDE7IHByb2dyZXNzIDw9IDEwMDA7ICsrcHJvZ3Jlc3MpIHtcbiAgLy8gICBhd2FpdCBDb250ZXh0LmN1cnJlbnQoKS5zbGVlcCgxMDAwKVxuICAvLyAgIC8vIHJlY29yZCBhY3Rpdml0eSBoZWFydGJlYXRcbiAgLy8gICBDb250ZXh0LmN1cnJlbnQoKS5oZWFydGJlYXQoKVxuICAvLyB9XG5cbiAgLy8gZm9yIChsZXQgaSA9IDA7IGkgPCB0eFN0ZXBzLmxlbmd0aDsgaSsrICkge1xuICAvLyAgIC8vIHJlbWVtYmVyIHRoaXMgY29udGFpbnMgYSBzZXF1ZW5jZS1zZW5zaXRpdmUgYXJyYXkgb2YgdHhzXG4gIC8vICAgY29uc3QgdHhTZXF1ZW5jZSA9IHR4U3RlcHNbaV0hXG5cbiAgLy8gICAvLyBkbyBwcmV3b3JrIGhlcmUgdG8gbWFwIG91dCBhbW91bnRzIChpdCBwcm9iYWJseSBzaG91bGRudCBlbmQgdXAgaGVyZSAocHJvYiBkbyB0aGlzIHVwc3RyZWFtPyksIGJ1dCB3ZSBjYW4gc2tldGNoIGl0IG91dCBoZXJlKVxuXG4gIC8vICAgLy8gZXZlbnR1YWxseS4uLi5cbiAgLy8gICBjb25zdCB0eHNJblN0ZXBTZXF1ZW5jZSA9IHR4U2VxdWVuY2UudHhzO1xuXG4gIC8vICAgZm9yIChsZXQgaiA9IDA7IGogPCB0eHNJblN0ZXBTZXF1ZW5jZS5sZW5ndGg7IGorKykge1xuICAvLyAgICAgY29uc3QgcGxhbm5lZFR4ID0gdHhzSW5TdGVwU2VxdWVuY2Vbal0hXG4gIC8vICAgICB0cnkge1xuICAvLyAgICAgICBhd2FpdCBkb1BsYW5uZWRUeFN0ZXAocGxhbm5lZFR4KVxuICAvLyAgICAgfSBjYXRjaCAoZSkge1xuXG4gIC8vICAgICB9XG4gIC8vICAgfVxuXG4gIC8vICAgLy8gdHhTdGVwRXhlY3V0aW9uIGFjdGl2aXR5ID9cbiAgLy8gfVxuXG4gIC8vIGRvIGFueSBzZWxsaW5nXG5cbiAgLy8gZG8gYW55IGJyaWRnaW5nXG5cbiAgLy8gZG8gYW55IGJ1eWluZy4uLlxuXG4gIC8vIGF3YWl0IGdyZWV0KHRleHQpXG4gIC8vIGF3YWl0IGdyZWV0X2VzKHRleHQpXG5cbiAgLy8gYXdhaXQgYWRkUmVtaW5kZXJUb0RhdGFiYXNlKHRleHQpO1xuICAvLyBhd2FpdCBub3RpZnlVc2VyKHRleHQpO1xuXG4gIGNvbnNvbGUubG9nKFwidGVtcG9yYWwgd29ya2VyOiBydW5uaW5nIHJlYmFsYW5jZSB3b3JrZmxvdyBbZW5kXVwiKTtcblxuICByZXR1cm4ge1xuICAgIHN1Y2Nlc3M6IHRydWUsXG4gIH07XG59O1xuIiwiLyogKGlnbm9yZWQpICovIiwiLyogKGlnbm9yZWQpICovIiwiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG4vLyBIZWxwZXJzLlxuY29uc3QgcyA9IDEwMDA7XG5jb25zdCBtID0gcyAqIDYwO1xuY29uc3QgaCA9IG0gKiA2MDtcbmNvbnN0IGQgPSBoICogMjQ7XG5jb25zdCB3ID0gZCAqIDc7XG5jb25zdCB5ID0gZCAqIDM2NS4yNTtcbmZ1bmN0aW9uIG1zKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgdmFsdWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGlzRmluaXRlKHZhbHVlKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnM/LmxvbmcgPyBmbXRMb25nKHZhbHVlKSA6IGZtdFNob3J0KHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGlzIG5vdCBhIHN0cmluZyBvciBudW1iZXIuJyk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gaXNFcnJvcihlcnJvcilcbiAgICAgICAgICAgID8gYCR7ZXJyb3IubWVzc2FnZX0uIHZhbHVlPSR7SlNPTi5zdHJpbmdpZnkodmFsdWUpfWBcbiAgICAgICAgICAgIDogJ0FuIHVua25vd24gZXJyb3IgaGFzIG9jY3VyZWQuJztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbn1cbi8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICovXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgICBzdHIgPSBTdHJpbmcoc3RyKTtcbiAgICBpZiAoc3RyLmxlbmd0aCA+IDEwMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1ZhbHVlIGV4Y2VlZHMgdGhlIG1heGltdW0gbGVuZ3RoIG9mIDEwMCBjaGFyYWN0ZXJzLicpO1xuICAgIH1cbiAgICBjb25zdCBtYXRjaCA9IC9eKC0/KD86XFxkKyk/XFwuP1xcZCspICoobWlsbGlzZWNvbmRzP3xtc2Vjcz98bXN8c2Vjb25kcz98c2Vjcz98c3xtaW51dGVzP3xtaW5zP3xtfGhvdXJzP3xocnM/fGh8ZGF5cz98ZHx3ZWVrcz98d3x5ZWFycz98eXJzP3x5KT8kL2kuZXhlYyhzdHIpO1xuICAgIGlmICghbWF0Y2gpIHtcbiAgICAgICAgcmV0dXJuIE5hTjtcbiAgICB9XG4gICAgY29uc3QgbiA9IHBhcnNlRmxvYXQobWF0Y2hbMV0pO1xuICAgIGNvbnN0IHR5cGUgPSAobWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgY2FzZSAneWVhcnMnOlxuICAgICAgICBjYXNlICd5ZWFyJzpcbiAgICAgICAgY2FzZSAneXJzJzpcbiAgICAgICAgY2FzZSAneXInOlxuICAgICAgICBjYXNlICd5JzpcbiAgICAgICAgICAgIHJldHVybiBuICogeTtcbiAgICAgICAgY2FzZSAnd2Vla3MnOlxuICAgICAgICBjYXNlICd3ZWVrJzpcbiAgICAgICAgY2FzZSAndyc6XG4gICAgICAgICAgICByZXR1cm4gbiAqIHc7XG4gICAgICAgIGNhc2UgJ2RheXMnOlxuICAgICAgICBjYXNlICdkYXknOlxuICAgICAgICBjYXNlICdkJzpcbiAgICAgICAgICAgIHJldHVybiBuICogZDtcbiAgICAgICAgY2FzZSAnaG91cnMnOlxuICAgICAgICBjYXNlICdob3VyJzpcbiAgICAgICAgY2FzZSAnaHJzJzpcbiAgICAgICAgY2FzZSAnaHInOlxuICAgICAgICBjYXNlICdoJzpcbiAgICAgICAgICAgIHJldHVybiBuICogaDtcbiAgICAgICAgY2FzZSAnbWludXRlcyc6XG4gICAgICAgIGNhc2UgJ21pbnV0ZSc6XG4gICAgICAgIGNhc2UgJ21pbnMnOlxuICAgICAgICBjYXNlICdtaW4nOlxuICAgICAgICBjYXNlICdtJzpcbiAgICAgICAgICAgIHJldHVybiBuICogbTtcbiAgICAgICAgY2FzZSAnc2Vjb25kcyc6XG4gICAgICAgIGNhc2UgJ3NlY29uZCc6XG4gICAgICAgIGNhc2UgJ3NlY3MnOlxuICAgICAgICBjYXNlICdzZWMnOlxuICAgICAgICBjYXNlICdzJzpcbiAgICAgICAgICAgIHJldHVybiBuICogcztcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmRzJzpcbiAgICAgICAgY2FzZSAnbWlsbGlzZWNvbmQnOlxuICAgICAgICBjYXNlICdtc2Vjcyc6XG4gICAgICAgIGNhc2UgJ21zZWMnOlxuICAgICAgICBjYXNlICdtcyc6XG4gICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIC8vIFRoaXMgc2hvdWxkIG5ldmVyIG9jY3VyLlxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUaGUgdW5pdCAke3R5cGV9IHdhcyBtYXRjaGVkLCBidXQgbm8gbWF0Y2hpbmcgY2FzZSBleGlzdHMuYCk7XG4gICAgfVxufVxuZXhwb3J0cy5kZWZhdWx0ID0gbXM7XG4vKipcbiAqIFNob3J0IGZvcm1hdCBmb3IgYG1zYC5cbiAqL1xuZnVuY3Rpb24gZm10U2hvcnQobXMpIHtcbiAgICBjb25zdCBtc0FicyA9IE1hdGguYWJzKG1zKTtcbiAgICBpZiAobXNBYnMgPj0gZCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIGQpfWRgO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gaCkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIGgpfWhgO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIG0pfW1gO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gYCR7TWF0aC5yb3VuZChtcyAvIHMpfXNgO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bXN9bXNgO1xufVxuLyoqXG4gKiBMb25nIGZvcm1hdCBmb3IgYG1zYC5cbiAqL1xuZnVuY3Rpb24gZm10TG9uZyhtcykge1xuICAgIGNvbnN0IG1zQWJzID0gTWF0aC5hYnMobXMpO1xuICAgIGlmIChtc0FicyA+PSBkKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBkLCAnZGF5Jyk7XG4gICAgfVxuICAgIGlmIChtc0FicyA+PSBoKSB7XG4gICAgICAgIHJldHVybiBwbHVyYWwobXMsIG1zQWJzLCBoLCAnaG91cicpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gbSkge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgbSwgJ21pbnV0ZScpO1xuICAgIH1cbiAgICBpZiAobXNBYnMgPj0gcykge1xuICAgICAgICByZXR1cm4gcGx1cmFsKG1zLCBtc0FicywgcywgJ3NlY29uZCcpO1xuICAgIH1cbiAgICByZXR1cm4gYCR7bXN9IG1zYDtcbn1cbi8qKlxuICogUGx1cmFsaXphdGlvbiBoZWxwZXIuXG4gKi9cbmZ1bmN0aW9uIHBsdXJhbChtcywgbXNBYnMsIG4sIG5hbWUpIHtcbiAgICBjb25zdCBpc1BsdXJhbCA9IG1zQWJzID49IG4gKiAxLjU7XG4gICAgcmV0dXJuIGAke01hdGgucm91bmQobXMgLyBuKX0gJHtuYW1lfSR7aXNQbHVyYWwgPyAncycgOiAnJ31gO1xufVxuLyoqXG4gKiBBIHR5cGUgZ3VhcmQgZm9yIGVycm9ycy5cbiAqL1xuZnVuY3Rpb24gaXNFcnJvcihlcnJvcikge1xuICAgIHJldHVybiB0eXBlb2YgZXJyb3IgPT09ICdvYmplY3QnICYmIGVycm9yICE9PSBudWxsICYmICdtZXNzYWdlJyBpbiBlcnJvcjtcbn1cbm1vZHVsZS5leHBvcnRzID0gZXhwb3J0cy5kZWZhdWx0O1xubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IGV4cG9ydHMuZGVmYXVsdDtcbiIsIi8vIEdFTkVSQVRFRCBGSUxFLiBETyBOT1QgRURJVC5cbnZhciBMb25nID0gKGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIFxuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHtcbiAgICB2YWx1ZTogdHJ1ZVxuICB9KTtcbiAgZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuICBcbiAgLyoqXG4gICAqIEBsaWNlbnNlXG4gICAqIENvcHlyaWdodCAyMDA5IFRoZSBDbG9zdXJlIExpYnJhcnkgQXV0aG9yc1xuICAgKiBDb3B5cmlnaHQgMjAyMCBEYW5pZWwgV2lydHogLyBUaGUgbG9uZy5qcyBBdXRob3JzLlxuICAgKlxuICAgKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICAgKiB5b3UgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuXG4gICAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICAgKlxuICAgKiAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gICAqXG4gICAqIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbiAgICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUyBJU1wiIEJBU0lTLFxuICAgKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAgICogU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuICAgKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAgICpcbiAgICogU1BEWC1MaWNlbnNlLUlkZW50aWZpZXI6IEFwYWNoZS0yLjBcbiAgICovXG4gIC8vIFdlYkFzc2VtYmx5IG9wdGltaXphdGlvbnMgdG8gZG8gbmF0aXZlIGk2NCBtdWx0aXBsaWNhdGlvbiBhbmQgZGl2aWRlXG4gIHZhciB3YXNtID0gbnVsbDtcbiAgXG4gIHRyeSB7XG4gICAgd2FzbSA9IG5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZShuZXcgV2ViQXNzZW1ibHkuTW9kdWxlKG5ldyBVaW50OEFycmF5KFswLCA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDEzLCAyLCA5NiwgMCwgMSwgMTI3LCA5NiwgNCwgMTI3LCAxMjcsIDEyNywgMTI3LCAxLCAxMjcsIDMsIDcsIDYsIDAsIDEsIDEsIDEsIDEsIDEsIDYsIDYsIDEsIDEyNywgMSwgNjUsIDAsIDExLCA3LCA1MCwgNiwgMywgMTA5LCAxMTcsIDEwOCwgMCwgMSwgNSwgMTAwLCAxMDUsIDExOCwgOTUsIDExNSwgMCwgMiwgNSwgMTAwLCAxMDUsIDExOCwgOTUsIDExNywgMCwgMywgNSwgMTE0LCAxMDEsIDEwOSwgOTUsIDExNSwgMCwgNCwgNSwgMTE0LCAxMDEsIDEwOSwgOTUsIDExNywgMCwgNSwgOCwgMTAzLCAxMDEsIDExNiwgOTUsIDEwNCwgMTA1LCAxMDMsIDEwNCwgMCwgMCwgMTAsIDE5MSwgMSwgNiwgNCwgMCwgMzUsIDAsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjYsIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEyNywgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMSwgMzYsIDEsIDEsIDEyNiwgMzIsIDAsIDE3MywgMzIsIDEsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMzIsIDIsIDE3MywgMzIsIDMsIDE3MywgNjYsIDMyLCAxMzQsIDEzMiwgMTI4LCAzNCwgNCwgNjYsIDMyLCAxMzUsIDE2NywgMzYsIDAsIDMyLCA0LCAxNjcsIDExLCAzNiwgMSwgMSwgMTI2LCAzMiwgMCwgMTczLCAzMiwgMSwgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAzMiwgMiwgMTczLCAzMiwgMywgMTczLCA2NiwgMzIsIDEzNCwgMTMyLCAxMjksIDM0LCA0LCA2NiwgMzIsIDEzNSwgMTY3LCAzNiwgMCwgMzIsIDQsIDE2NywgMTEsIDM2LCAxLCAxLCAxMjYsIDMyLCAwLCAxNzMsIDMyLCAxLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDMyLCAyLCAxNzMsIDMyLCAzLCAxNzMsIDY2LCAzMiwgMTM0LCAxMzIsIDEzMCwgMzQsIDQsIDY2LCAzMiwgMTM1LCAxNjcsIDM2LCAwLCAzMiwgNCwgMTY3LCAxMV0pKSwge30pLmV4cG9ydHM7XG4gIH0gY2F0Y2ggKGUpIHsvLyBubyB3YXNtIHN1cHBvcnQgOihcbiAgfVxuICAvKipcbiAgICogQ29uc3RydWN0cyBhIDY0IGJpdCB0d28ncy1jb21wbGVtZW50IGludGVnZXIsIGdpdmVuIGl0cyBsb3cgYW5kIGhpZ2ggMzIgYml0IHZhbHVlcyBhcyAqc2lnbmVkKiBpbnRlZ2Vycy5cbiAgICogIFNlZSB0aGUgZnJvbSogZnVuY3Rpb25zIGJlbG93IGZvciBtb3JlIGNvbnZlbmllbnQgd2F5cyBvZiBjb25zdHJ1Y3RpbmcgTG9uZ3MuXG4gICAqIEBleHBvcnRzIExvbmdcbiAgICogQGNsYXNzIEEgTG9uZyBjbGFzcyBmb3IgcmVwcmVzZW50aW5nIGEgNjQgYml0IHR3bydzLWNvbXBsZW1lbnQgaW50ZWdlciB2YWx1ZS5cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvdyBUaGUgbG93IChzaWduZWQpIDMyIGJpdHMgb2YgdGhlIGxvbmdcbiAgICogQHBhcmFtIHtudW1iZXJ9IGhpZ2ggVGhlIGhpZ2ggKHNpZ25lZCkgMzIgYml0cyBvZiB0aGUgbG9uZ1xuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBjb25zdHJ1Y3RvclxuICAgKi9cbiAgXG4gIFxuICBmdW5jdGlvbiBMb25nKGxvdywgaGlnaCwgdW5zaWduZWQpIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbG93IDMyIGJpdHMgYXMgYSBzaWduZWQgdmFsdWUuXG4gICAgICogQHR5cGUge251bWJlcn1cbiAgICAgKi9cbiAgICB0aGlzLmxvdyA9IGxvdyB8IDA7XG4gICAgLyoqXG4gICAgICogVGhlIGhpZ2ggMzIgYml0cyBhcyBhIHNpZ25lZCB2YWx1ZS5cbiAgICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgICAqL1xuICBcbiAgICB0aGlzLmhpZ2ggPSBoaWdoIHwgMDtcbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdC5cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgXG4gICAgdGhpcy51bnNpZ25lZCA9ICEhdW5zaWduZWQ7XG4gIH0gLy8gVGhlIGludGVybmFsIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9uZyBpcyB0aGUgdHdvIGdpdmVuIHNpZ25lZCwgMzItYml0IHZhbHVlcy5cbiAgLy8gV2UgdXNlIDMyLWJpdCBwaWVjZXMgYmVjYXVzZSB0aGVzZSBhcmUgdGhlIHNpemUgb2YgaW50ZWdlcnMgb24gd2hpY2hcbiAgLy8gSmF2YXNjcmlwdCBwZXJmb3JtcyBiaXQtb3BlcmF0aW9ucy4gIEZvciBvcGVyYXRpb25zIGxpa2UgYWRkaXRpb24gYW5kXG4gIC8vIG11bHRpcGxpY2F0aW9uLCB3ZSBzcGxpdCBlYWNoIG51bWJlciBpbnRvIDE2IGJpdCBwaWVjZXMsIHdoaWNoIGNhbiBlYXNpbHkgYmVcbiAgLy8gbXVsdGlwbGllZCB3aXRoaW4gSmF2YXNjcmlwdCdzIGZsb2F0aW5nLXBvaW50IHJlcHJlc2VudGF0aW9uIHdpdGhvdXQgb3ZlcmZsb3dcbiAgLy8gb3IgY2hhbmdlIGluIHNpZ24uXG4gIC8vXG4gIC8vIEluIHRoZSBhbGdvcml0aG1zIGJlbG93LCB3ZSBmcmVxdWVudGx5IHJlZHVjZSB0aGUgbmVnYXRpdmUgY2FzZSB0byB0aGVcbiAgLy8gcG9zaXRpdmUgY2FzZSBieSBuZWdhdGluZyB0aGUgaW5wdXQocykgYW5kIHRoZW4gcG9zdC1wcm9jZXNzaW5nIHRoZSByZXN1bHQuXG4gIC8vIE5vdGUgdGhhdCB3ZSBtdXN0IEFMV0FZUyBjaGVjayBzcGVjaWFsbHkgd2hldGhlciB0aG9zZSB2YWx1ZXMgYXJlIE1JTl9WQUxVRVxuICAvLyAoLTJeNjMpIGJlY2F1c2UgLU1JTl9WQUxVRSA9PSBNSU5fVkFMVUUgKHNpbmNlIDJeNjMgY2Fubm90IGJlIHJlcHJlc2VudGVkIGFzXG4gIC8vIGEgcG9zaXRpdmUgbnVtYmVyLCBpdCBvdmVyZmxvd3MgYmFjayBpbnRvIGEgbmVnYXRpdmUpLiAgTm90IGhhbmRsaW5nIHRoaXNcbiAgLy8gY2FzZSB3b3VsZCBvZnRlbiByZXN1bHQgaW4gaW5maW5pdGUgcmVjdXJzaW9uLlxuICAvL1xuICAvLyBDb21tb24gY29uc3RhbnQgdmFsdWVzIFpFUk8sIE9ORSwgTkVHX09ORSwgZXRjLiBhcmUgZGVmaW5lZCBiZWxvdyB0aGUgZnJvbSpcbiAgLy8gbWV0aG9kcyBvbiB3aGljaCB0aGV5IGRlcGVuZC5cbiAgXG4gIC8qKlxuICAgKiBBbiBpbmRpY2F0b3IgdXNlZCB0byByZWxpYWJseSBkZXRlcm1pbmUgaWYgYW4gb2JqZWN0IGlzIGEgTG9uZyBvciBub3QuXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAY29uc3RcbiAgICogQHByaXZhdGVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5wcm90b3R5cGUuX19pc0xvbmdfXztcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KExvbmcucHJvdG90eXBlLCBcIl9faXNMb25nX19cIiwge1xuICAgIHZhbHVlOiB0cnVlXG4gIH0pO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7Kn0gb2JqIE9iamVjdFxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gaXNMb25nKG9iaikge1xuICAgIHJldHVybiAob2JqICYmIG9ialtcIl9faXNMb25nX19cIl0pID09PSB0cnVlO1xuICB9XG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHsqfSB2YWx1ZSBudW1iZXJcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgXG4gIGZ1bmN0aW9uIGN0ejMyKHZhbHVlKSB7XG4gICAgdmFyIGMgPSBNYXRoLmNsejMyKHZhbHVlICYgLXZhbHVlKTtcbiAgICByZXR1cm4gdmFsdWUgPyAzMSAtIGMgOiBjO1xuICB9XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGUgc3BlY2lmaWVkIG9iamVjdCBpcyBhIExvbmcuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyp9IG9iaiBPYmplY3RcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmcuaXNMb25nID0gaXNMb25nO1xuICAvKipcbiAgICogQSBjYWNoZSBvZiB0aGUgTG9uZyByZXByZXNlbnRhdGlvbnMgb2Ygc21hbGwgaW50ZWdlciB2YWx1ZXMuXG4gICAqIEB0eXBlIHshT2JqZWN0fVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgSU5UX0NBQ0hFID0ge307XG4gIC8qKlxuICAgKiBBIGNhY2hlIG9mIHRoZSBMb25nIHJlcHJlc2VudGF0aW9ucyBvZiBzbWFsbCB1bnNpZ25lZCBpbnRlZ2VyIHZhbHVlcy5cbiAgICogQHR5cGUgeyFPYmplY3R9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVSU5UX0NBQ0hFID0ge307XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gdmFsdWVcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tSW50KHZhbHVlLCB1bnNpZ25lZCkge1xuICAgIHZhciBvYmosIGNhY2hlZE9iaiwgY2FjaGU7XG4gIFxuICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgdmFsdWUgPj4+PSAwO1xuICBcbiAgICAgIGlmIChjYWNoZSA9IDAgPD0gdmFsdWUgJiYgdmFsdWUgPCAyNTYpIHtcbiAgICAgICAgY2FjaGVkT2JqID0gVUlOVF9DQUNIRVt2YWx1ZV07XG4gICAgICAgIGlmIChjYWNoZWRPYmopIHJldHVybiBjYWNoZWRPYmo7XG4gICAgICB9XG4gIFxuICAgICAgb2JqID0gZnJvbUJpdHModmFsdWUsIDAsIHRydWUpO1xuICAgICAgaWYgKGNhY2hlKSBVSU5UX0NBQ0hFW3ZhbHVlXSA9IG9iajtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlIHw9IDA7XG4gIFxuICAgICAgaWYgKGNhY2hlID0gLTEyOCA8PSB2YWx1ZSAmJiB2YWx1ZSA8IDEyOCkge1xuICAgICAgICBjYWNoZWRPYmogPSBJTlRfQ0FDSEVbdmFsdWVdO1xuICAgICAgICBpZiAoY2FjaGVkT2JqKSByZXR1cm4gY2FjaGVkT2JqO1xuICAgICAgfVxuICBcbiAgICAgIG9iaiA9IGZyb21CaXRzKHZhbHVlLCB2YWx1ZSA8IDAgPyAtMSA6IDAsIGZhbHNlKTtcbiAgICAgIGlmIChjYWNoZSkgSU5UX0NBQ0hFW3ZhbHVlXSA9IG9iajtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfVxuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRpbmcgdGhlIGdpdmVuIDMyIGJpdCBpbnRlZ2VyIHZhbHVlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIFRoZSAzMiBiaXQgaW50ZWdlciBpbiBxdWVzdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21JbnQgPSBmcm9tSW50O1xuICAvKipcbiAgICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbU51bWJlcih2YWx1ZSwgdW5zaWduZWQpIHtcbiAgICBpZiAoaXNOYU4odmFsdWUpKSByZXR1cm4gdW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gIFxuICAgIGlmICh1bnNpZ25lZCkge1xuICAgICAgaWYgKHZhbHVlIDwgMCkgcmV0dXJuIFVaRVJPO1xuICAgICAgaWYgKHZhbHVlID49IFRXT19QV1JfNjRfREJMKSByZXR1cm4gTUFYX1VOU0lHTkVEX1ZBTFVFO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodmFsdWUgPD0gLVRXT19QV1JfNjNfREJMKSByZXR1cm4gTUlOX1ZBTFVFO1xuICAgICAgaWYgKHZhbHVlICsgMSA+PSBUV09fUFdSXzYzX0RCTCkgcmV0dXJuIE1BWF9WQUxVRTtcbiAgICB9XG4gIFxuICAgIGlmICh2YWx1ZSA8IDApIHJldHVybiBmcm9tTnVtYmVyKC12YWx1ZSwgdW5zaWduZWQpLm5lZygpO1xuICAgIHJldHVybiBmcm9tQml0cyh2YWx1ZSAlIFRXT19QV1JfMzJfREJMIHwgMCwgdmFsdWUgLyBUV09fUFdSXzMyX0RCTCB8IDAsIHVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiB2YWx1ZSwgcHJvdmlkZWQgdGhhdCBpdCBpcyBhIGZpbml0ZSBudW1iZXIuIE90aGVyd2lzZSwgemVybyBpcyByZXR1cm5lZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBUaGUgbnVtYmVyIGluIHF1ZXN0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbU51bWJlciA9IGZyb21OdW1iZXI7XG4gIC8qKlxuICAgKiBAcGFyYW0ge251bWJlcn0gbG93Qml0c1xuICAgKiBAcGFyYW0ge251bWJlcn0gaGlnaEJpdHNcbiAgICogQHBhcmFtIHtib29sZWFuPX0gdW5zaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tQml0cyhsb3dCaXRzLCBoaWdoQml0cywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcobG93Qml0cywgaGlnaEJpdHMsIHVuc2lnbmVkKTtcbiAgfVxuICAvKipcbiAgICogUmV0dXJucyBhIExvbmcgcmVwcmVzZW50aW5nIHRoZSA2NCBiaXQgaW50ZWdlciB0aGF0IGNvbWVzIGJ5IGNvbmNhdGVuYXRpbmcgdGhlIGdpdmVuIGxvdyBhbmQgaGlnaCBiaXRzLiBFYWNoIGlzXG4gICAqICBhc3N1bWVkIHRvIHVzZSAzMiBiaXRzLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ9IGxvd0JpdHMgVGhlIGxvdyAzMiBiaXRzXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBoaWdoQml0cyBUaGUgaGlnaCAzMiBiaXRzXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMgeyFMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJpdHMgPSBmcm9tQml0cztcbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcn0gYmFzZVxuICAgKiBAcGFyYW0ge251bWJlcn0gZXhwb25lbnRcbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIHBvd19kYmwgPSBNYXRoLnBvdzsgLy8gVXNlZCA0IHRpbWVzICg0KjggdG8gMTUrNClcbiAgXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gICAqIEBwYXJhbSB7KGJvb2xlYW58bnVtYmVyKT19IHVuc2lnbmVkXG4gICAqIEBwYXJhbSB7bnVtYmVyPX0gcmFkaXhcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICBmdW5jdGlvbiBmcm9tU3RyaW5nKHN0ciwgdW5zaWduZWQsIHJhZGl4KSB7XG4gICAgaWYgKHN0ci5sZW5ndGggPT09IDApIHRocm93IEVycm9yKCdlbXB0eSBzdHJpbmcnKTtcbiAgXG4gICAgaWYgKHR5cGVvZiB1bnNpZ25lZCA9PT0gJ251bWJlcicpIHtcbiAgICAgIC8vIEZvciBnb29nLm1hdGgubG9uZyBjb21wYXRpYmlsaXR5XG4gICAgICByYWRpeCA9IHVuc2lnbmVkO1xuICAgICAgdW5zaWduZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdW5zaWduZWQgPSAhIXVuc2lnbmVkO1xuICAgIH1cbiAgXG4gICAgaWYgKHN0ciA9PT0gXCJOYU5cIiB8fCBzdHIgPT09IFwiSW5maW5pdHlcIiB8fCBzdHIgPT09IFwiK0luZmluaXR5XCIgfHwgc3RyID09PSBcIi1JbmZpbml0eVwiKSByZXR1cm4gdW5zaWduZWQgPyBVWkVSTyA6IFpFUk87XG4gICAgcmFkaXggPSByYWRpeCB8fCAxMDtcbiAgICBpZiAocmFkaXggPCAyIHx8IDM2IDwgcmFkaXgpIHRocm93IFJhbmdlRXJyb3IoJ3JhZGl4Jyk7XG4gICAgdmFyIHA7XG4gICAgaWYgKChwID0gc3RyLmluZGV4T2YoJy0nKSkgPiAwKSB0aHJvdyBFcnJvcignaW50ZXJpb3IgaHlwaGVuJyk7ZWxzZSBpZiAocCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGZyb21TdHJpbmcoc3RyLnN1YnN0cmluZygxKSwgdW5zaWduZWQsIHJhZGl4KS5uZWcoKTtcbiAgICB9IC8vIERvIHNldmVyYWwgKDgpIGRpZ2l0cyBlYWNoIHRpbWUgdGhyb3VnaCB0aGUgbG9vcCwgc28gYXMgdG9cbiAgICAvLyBtaW5pbWl6ZSB0aGUgY2FsbHMgdG8gdGhlIHZlcnkgZXhwZW5zaXZlIGVtdWxhdGVkIGRpdi5cbiAgXG4gICAgdmFyIHJhZGl4VG9Qb3dlciA9IGZyb21OdW1iZXIocG93X2RibChyYWRpeCwgOCkpO1xuICAgIHZhciByZXN1bHQgPSBaRVJPO1xuICBcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkgKz0gOCkge1xuICAgICAgdmFyIHNpemUgPSBNYXRoLm1pbig4LCBzdHIubGVuZ3RoIC0gaSksXG4gICAgICAgICAgdmFsdWUgPSBwYXJzZUludChzdHIuc3Vic3RyaW5nKGksIGkgKyBzaXplKSwgcmFkaXgpO1xuICBcbiAgICAgIGlmIChzaXplIDwgOCkge1xuICAgICAgICB2YXIgcG93ZXIgPSBmcm9tTnVtYmVyKHBvd19kYmwocmFkaXgsIHNpemUpKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0Lm11bChwb3dlcikuYWRkKGZyb21OdW1iZXIodmFsdWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHJlc3VsdC5tdWwocmFkaXhUb1Bvd2VyKTtcbiAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmFkZChmcm9tTnVtYmVyKHZhbHVlKSk7XG4gICAgICB9XG4gICAgfVxuICBcbiAgICByZXN1bHQudW5zaWduZWQgPSB1bnNpZ25lZDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgTG9uZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgZ2l2ZW4gc3RyaW5nLCB3cml0dGVuIHVzaW5nIHRoZSBzcGVjaWZpZWQgcmFkaXguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3RyIFRoZSB0ZXh0dWFsIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBMb25nXG4gICAqIEBwYXJhbSB7KGJvb2xlYW58bnVtYmVyKT19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBUaGUgcmFkaXggaW4gd2hpY2ggdGhlIHRleHQgaXMgd3JpdHRlbiAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAqIEByZXR1cm5zIHshTG9uZ30gVGhlIGNvcnJlc3BvbmRpbmcgTG9uZyB2YWx1ZVxuICAgKi9cbiAgXG4gIFxuICBMb25nLmZyb21TdHJpbmcgPSBmcm9tU3RyaW5nO1xuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ3whe2xvdzogbnVtYmVyLCBoaWdoOiBudW1iZXIsIHVuc2lnbmVkOiBib29sZWFufX0gdmFsXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgZnVuY3Rpb24gZnJvbVZhbHVlKHZhbCwgdW5zaWduZWQpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHJldHVybiBmcm9tTnVtYmVyKHZhbCwgdW5zaWduZWQpO1xuICAgIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykgcmV0dXJuIGZyb21TdHJpbmcodmFsLCB1bnNpZ25lZCk7IC8vIFRocm93cyBmb3Igbm9uLW9iamVjdHMsIGNvbnZlcnRzIG5vbi1pbnN0YW5jZW9mIExvbmc6XG4gIFxuICAgIHJldHVybiBmcm9tQml0cyh2YWwubG93LCB2YWwuaGlnaCwgdHlwZW9mIHVuc2lnbmVkID09PSAnYm9vbGVhbicgPyB1bnNpZ25lZCA6IHZhbC51bnNpZ25lZCk7XG4gIH1cbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBzcGVjaWZpZWQgdmFsdWUgdG8gYSBMb25nIHVzaW5nIHRoZSBhcHByb3ByaWF0ZSBmcm9tKiBmdW5jdGlvbiBmb3IgaXRzIHR5cGUuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd8IXtsb3c6IG51bWJlciwgaGlnaDogbnVtYmVyLCB1bnNpZ25lZDogYm9vbGVhbn19IHZhbCBWYWx1ZVxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tVmFsdWUgPSBmcm9tVmFsdWU7IC8vIE5PVEU6IHRoZSBjb21waWxlciBzaG91bGQgaW5saW5lIHRoZXNlIGNvbnN0YW50IHZhbHVlcyBiZWxvdyBhbmQgdGhlbiByZW1vdmUgdGhlc2UgdmFyaWFibGVzLCBzbyB0aGVyZSBzaG91bGQgYmVcbiAgLy8gbm8gcnVudGltZSBwZW5hbHR5IGZvciB0aGVzZS5cbiAgXG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfMTZfREJMID0gMSA8PCAxNjtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8yNF9EQkwgPSAxIDw8IDI0O1xuICAvKipcbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGNvbnN0XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBUV09fUFdSXzMyX0RCTCA9IFRXT19QV1JfMTZfREJMICogVFdPX1BXUl8xNl9EQkw7XG4gIC8qKlxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAY29uc3RcbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFRXT19QV1JfNjRfREJMID0gVFdPX1BXUl8zMl9EQkwgKiBUV09fUFdSXzMyX0RCTDtcbiAgLyoqXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl82M19EQkwgPSBUV09fUFdSXzY0X0RCTCAvIDI7XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBjb25zdFxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgVFdPX1BXUl8yNCA9IGZyb21JbnQoVFdPX1BXUl8yNF9EQkwpO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgWkVSTyA9IGZyb21JbnQoMCk7XG4gIC8qKlxuICAgKiBTaWduZWQgemVyby5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuWkVSTyA9IFpFUk87XG4gIC8qKlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBVWkVSTyA9IGZyb21JbnQoMCwgdHJ1ZSk7XG4gIC8qKlxuICAgKiBVbnNpZ25lZCB6ZXJvLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5VWkVSTyA9IFVaRVJPO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgT05FID0gZnJvbUludCgxKTtcbiAgLyoqXG4gICAqIFNpZ25lZCBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk9ORSA9IE9ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIFVPTkUgPSBmcm9tSW50KDEsIHRydWUpO1xuICAvKipcbiAgICogVW5zaWduZWQgb25lLlxuICAgKiBAdHlwZSB7IUxvbmd9XG4gICAqL1xuICBcbiAgTG9uZy5VT05FID0gVU9ORTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE5FR19PTkUgPSBmcm9tSW50KC0xKTtcbiAgLyoqXG4gICAqIFNpZ25lZCBuZWdhdGl2ZSBvbmUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk5FR19PTkUgPSBORUdfT05FO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUFYX1ZBTFVFID0gZnJvbUJpdHMoMHhGRkZGRkZGRiB8IDAsIDB4N0ZGRkZGRkYgfCAwLCBmYWxzZSk7XG4gIC8qKlxuICAgKiBNYXhpbXVtIHNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUFYX1ZBTFVFID0gTUFYX1ZBTFVFO1xuICAvKipcbiAgICogQHR5cGUgeyFMb25nfVxuICAgKiBAaW5uZXJcbiAgICovXG4gIFxuICB2YXIgTUFYX1VOU0lHTkVEX1ZBTFVFID0gZnJvbUJpdHMoMHhGRkZGRkZGRiB8IDAsIDB4RkZGRkZGRkYgfCAwLCB0cnVlKTtcbiAgLyoqXG4gICAqIE1heGltdW0gdW5zaWduZWQgdmFsdWUuXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nLk1BWF9VTlNJR05FRF9WQUxVRSA9IE1BWF9VTlNJR05FRF9WQUxVRTtcbiAgLyoqXG4gICAqIEB0eXBlIHshTG9uZ31cbiAgICogQGlubmVyXG4gICAqL1xuICBcbiAgdmFyIE1JTl9WQUxVRSA9IGZyb21CaXRzKDAsIDB4ODAwMDAwMDAgfCAwLCBmYWxzZSk7XG4gIC8qKlxuICAgKiBNaW5pbXVtIHNpZ25lZCB2YWx1ZS5cbiAgICogQHR5cGUgeyFMb25nfVxuICAgKi9cbiAgXG4gIExvbmcuTUlOX1ZBTFVFID0gTUlOX1ZBTFVFO1xuICAvKipcbiAgICogQGFsaWFzIExvbmcucHJvdG90eXBlXG4gICAqIEBpbm5lclxuICAgKi9cbiAgXG4gIHZhciBMb25nUHJvdG90eXBlID0gTG9uZy5wcm90b3R5cGU7XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIDMyIGJpdCBpbnRlZ2VyLCBhc3N1bWluZyBpdCBpcyBhIDMyIGJpdCBpbnRlZ2VyLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0ludCA9IGZ1bmN0aW9uIHRvSW50KCkge1xuICAgIHJldHVybiB0aGlzLnVuc2lnbmVkID8gdGhpcy5sb3cgPj4+IDAgOiB0aGlzLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoZSBMb25nIHRvIGEgdGhlIG5lYXJlc3QgZmxvYXRpbmctcG9pbnQgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2YWx1ZSAoZG91YmxlLCA1MyBiaXQgbWFudGlzc2EpLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUudG9OdW1iZXIgPSBmdW5jdGlvbiB0b051bWJlcigpIHtcbiAgICBpZiAodGhpcy51bnNpZ25lZCkgcmV0dXJuICh0aGlzLmhpZ2ggPj4+IDApICogVFdPX1BXUl8zMl9EQkwgKyAodGhpcy5sb3cgPj4+IDApO1xuICAgIHJldHVybiB0aGlzLmhpZ2ggKiBUV09fUFdSXzMyX0RCTCArICh0aGlzLmxvdyA+Pj4gMCk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGUgTG9uZyB0byBhIHN0cmluZyB3cml0dGVuIGluIHRoZSBzcGVjaWZpZWQgcmFkaXguXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXI9fSByYWRpeCBSYWRpeCAoMi0zNiksIGRlZmF1bHRzIHRvIDEwXG4gICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAqIEBvdmVycmlkZVxuICAgKiBAdGhyb3dzIHtSYW5nZUVycm9yfSBJZiBgcmFkaXhgIGlzIG91dCBvZiByYW5nZVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcocmFkaXgpIHtcbiAgICByYWRpeCA9IHJhZGl4IHx8IDEwO1xuICAgIGlmIChyYWRpeCA8IDIgfHwgMzYgPCByYWRpeCkgdGhyb3cgUmFuZ2VFcnJvcigncmFkaXgnKTtcbiAgICBpZiAodGhpcy5pc1plcm8oKSkgcmV0dXJuICcwJztcbiAgXG4gICAgaWYgKHRoaXMuaXNOZWdhdGl2ZSgpKSB7XG4gICAgICAvLyBVbnNpZ25lZCBMb25ncyBhcmUgbmV2ZXIgbmVnYXRpdmVcbiAgICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBjaGFuZ2UgdGhlIExvbmcgdmFsdWUgYmVmb3JlIGl0IGNhbiBiZSBuZWdhdGVkLCBzbyB3ZSByZW1vdmVcbiAgICAgICAgLy8gdGhlIGJvdHRvbS1tb3N0IGRpZ2l0IGluIHRoaXMgYmFzZSBhbmQgdGhlbiByZWN1cnNlIHRvIGRvIHRoZSByZXN0LlxuICAgICAgICB2YXIgcmFkaXhMb25nID0gZnJvbU51bWJlcihyYWRpeCksXG4gICAgICAgICAgICBkaXYgPSB0aGlzLmRpdihyYWRpeExvbmcpLFxuICAgICAgICAgICAgcmVtMSA9IGRpdi5tdWwocmFkaXhMb25nKS5zdWIodGhpcyk7XG4gICAgICAgIHJldHVybiBkaXYudG9TdHJpbmcocmFkaXgpICsgcmVtMS50b0ludCgpLnRvU3RyaW5nKHJhZGl4KTtcbiAgICAgIH0gZWxzZSByZXR1cm4gJy0nICsgdGhpcy5uZWcoKS50b1N0cmluZyhyYWRpeCk7XG4gICAgfSAvLyBEbyBzZXZlcmFsICg2KSBkaWdpdHMgZWFjaCB0aW1lIHRocm91Z2ggdGhlIGxvb3AsIHNvIGFzIHRvXG4gICAgLy8gbWluaW1pemUgdGhlIGNhbGxzIHRvIHRoZSB2ZXJ5IGV4cGVuc2l2ZSBlbXVsYXRlZCBkaXYuXG4gIFxuICBcbiAgICB2YXIgcmFkaXhUb1Bvd2VyID0gZnJvbU51bWJlcihwb3dfZGJsKHJhZGl4LCA2KSwgdGhpcy51bnNpZ25lZCksXG4gICAgICAgIHJlbSA9IHRoaXM7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICBcbiAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgdmFyIHJlbURpdiA9IHJlbS5kaXYocmFkaXhUb1Bvd2VyKSxcbiAgICAgICAgICBpbnR2YWwgPSByZW0uc3ViKHJlbURpdi5tdWwocmFkaXhUb1Bvd2VyKSkudG9JbnQoKSA+Pj4gMCxcbiAgICAgICAgICBkaWdpdHMgPSBpbnR2YWwudG9TdHJpbmcocmFkaXgpO1xuICAgICAgcmVtID0gcmVtRGl2O1xuICAgICAgaWYgKHJlbS5pc1plcm8oKSkgcmV0dXJuIGRpZ2l0cyArIHJlc3VsdDtlbHNlIHtcbiAgICAgICAgd2hpbGUgKGRpZ2l0cy5sZW5ndGggPCA2KSBkaWdpdHMgPSAnMCcgKyBkaWdpdHM7XG4gIFxuICAgICAgICByZXN1bHQgPSAnJyArIGRpZ2l0cyArIHJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBoaWdoIDMyIGJpdHMgYXMgYSBzaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBTaWduZWQgaGlnaCBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHMgPSBmdW5jdGlvbiBnZXRIaWdoQml0cygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoO1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgaGlnaCAzMiBiaXRzIGFzIGFuIHVuc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gVW5zaWduZWQgaGlnaCBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0SGlnaEJpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldEhpZ2hCaXRzVW5zaWduZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuaGlnaCA+Pj4gMDtcbiAgfTtcbiAgLyoqXG4gICAqIEdldHMgdGhlIGxvdyAzMiBiaXRzIGFzIGEgc2lnbmVkIGludGVnZXIuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn0gU2lnbmVkIGxvdyBiaXRzXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZ2V0TG93Qml0cyA9IGZ1bmN0aW9uIGdldExvd0JpdHMoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93O1xuICB9O1xuICAvKipcbiAgICogR2V0cyB0aGUgbG93IDMyIGJpdHMgYXMgYW4gdW5zaWduZWQgaW50ZWdlci5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSBVbnNpZ25lZCBsb3cgYml0c1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmdldExvd0JpdHNVbnNpZ25lZCA9IGZ1bmN0aW9uIGdldExvd0JpdHNVbnNpZ25lZCgpIHtcbiAgICByZXR1cm4gdGhpcy5sb3cgPj4+IDA7XG4gIH07XG4gIC8qKlxuICAgKiBHZXRzIHRoZSBudW1iZXIgb2YgYml0cyBuZWVkZWQgdG8gcmVwcmVzZW50IHRoZSBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge251bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5nZXROdW1CaXRzQWJzID0gZnVuY3Rpb24gZ2V0TnVtQml0c0FicygpIHtcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIC8vIFVuc2lnbmVkIExvbmdzIGFyZSBuZXZlciBuZWdhdGl2ZVxuICAgICAgcmV0dXJuIHRoaXMuZXEoTUlOX1ZBTFVFKSA/IDY0IDogdGhpcy5uZWcoKS5nZXROdW1CaXRzQWJzKCk7XG4gICAgdmFyIHZhbCA9IHRoaXMuaGlnaCAhPSAwID8gdGhpcy5oaWdoIDogdGhpcy5sb3c7XG4gIFxuICAgIGZvciAodmFyIGJpdCA9IDMxOyBiaXQgPiAwOyBiaXQtLSkgaWYgKCh2YWwgJiAxIDw8IGJpdCkgIT0gMCkgYnJlYWs7XG4gIFxuICAgIHJldHVybiB0aGlzLmhpZ2ggIT0gMCA/IGJpdCArIDMzIDogYml0ICsgMTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB6ZXJvLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmlzWmVybyA9IGZ1bmN0aW9uIGlzWmVybygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID09PSAwICYmIHRoaXMubG93ID09PSAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZXF1YWxzIHplcm8uIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjaXNaZXJvfS5cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXF6ID0gTG9uZ1Byb3RvdHlwZS5pc1plcm87XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBuZWdhdGl2ZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiBpc05lZ2F0aXZlKCkge1xuICAgIHJldHVybiAhdGhpcy51bnNpZ25lZCAmJiB0aGlzLmhpZ2ggPCAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgcG9zaXRpdmUgb3IgemVyby5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gaXNQb3NpdGl2ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51bnNpZ25lZCB8fCB0aGlzLmhpZ2ggPj0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIG9kZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5pc09kZCA9IGZ1bmN0aW9uIGlzT2RkKCkge1xuICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMTtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGV2ZW4uXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuaXNFdmVuID0gZnVuY3Rpb24gaXNFdmVuKCkge1xuICAgIHJldHVybiAodGhpcy5sb3cgJiAxKSA9PT0gMDtcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICBpZiAodGhpcy51bnNpZ25lZCAhPT0gb3RoZXIudW5zaWduZWQgJiYgdGhpcy5oaWdoID4+PiAzMSA9PT0gMSAmJiBvdGhlci5oaWdoID4+PiAzMSA9PT0gMSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0aGlzLmhpZ2ggPT09IG90aGVyLmhpZ2ggJiYgdGhpcy5sb3cgPT09IG90aGVyLmxvdztcbiAgfTtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGVxdWFscyB0aGUgc3BlY2lmaWVkJ3MuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjZXF1YWxzfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuZXEgPSBMb25nUHJvdG90eXBlLmVxdWFscztcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGRpZmZlcnMgZnJvbSB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5vdEVxdWFscyA9IGZ1bmN0aW9uIG5vdEVxdWFscyhvdGhlcikge1xuICAgIHJldHVybiAhdGhpcy5lcShcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcik7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBkaWZmZXJzIGZyb20gdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25vdEVxdWFsc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm5lcSA9IExvbmdQcm90b3R5cGUubm90RXF1YWxzO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgZGlmZmVycyBmcm9tIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNub3RFcXVhbHN9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5lID0gTG9uZ1Byb3RvdHlwZS5ub3RFcXVhbHM7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbiA9IGZ1bmN0aW9uIGxlc3NUaGFuKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPCAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbn0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmx0ID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbjtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlc3NUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGxlc3NUaGFuT3JFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpIDw9IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2xlc3NUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmx0ZSA9IExvbmdQcm90b3R5cGUubGVzc1RoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNsZXNzVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmxlID0gTG9uZ1Byb3RvdHlwZS5sZXNzVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIHNwZWNpZmllZCdzLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgdmFsdWVcbiAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbiA9IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuKG90aGVyKSB7XG4gICAgcmV0dXJuIHRoaXMuY29tcChcbiAgICAvKiB2YWxpZGF0ZXMgKi9cbiAgICBvdGhlcikgPiAwO1xuICB9O1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbn0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmd0ID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbjtcbiAgLyoqXG4gICAqIFRlc3RzIGlmIHRoaXMgTG9uZydzIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0aGUgc3BlY2lmaWVkJ3MuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdyZWF0ZXJUaGFuT3JFcXVhbCA9IGZ1bmN0aW9uIGdyZWF0ZXJUaGFuT3JFcXVhbChvdGhlcikge1xuICAgIHJldHVybiB0aGlzLmNvbXAoXG4gICAgLyogdmFsaWRhdGVzICovXG4gICAgb3RoZXIpID49IDA7XG4gIH07XG4gIC8qKlxuICAgKiBUZXN0cyBpZiB0aGlzIExvbmcncyB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2dyZWF0ZXJUaGFuT3JFcXVhbH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmd0ZSA9IExvbmdQcm90b3R5cGUuZ3JlYXRlclRoYW5PckVxdWFsO1xuICAvKipcbiAgICogVGVzdHMgaWYgdGhpcyBMb25nJ3MgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRoZSBzcGVjaWZpZWQncy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNncmVhdGVyVGhhbk9yRXF1YWx9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmdlID0gTG9uZ1Byb3RvdHlwZS5ncmVhdGVyVGhhbk9yRXF1YWw7XG4gIC8qKlxuICAgKiBDb21wYXJlcyB0aGlzIExvbmcncyB2YWx1ZSB3aXRoIHRoZSBzcGVjaWZpZWQncy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIHZhbHVlXG4gICAqIEByZXR1cm5zIHtudW1iZXJ9IDAgaWYgdGhleSBhcmUgdGhlIHNhbWUsIDEgaWYgdGhlIHRoaXMgaXMgZ3JlYXRlciBhbmQgLTFcbiAgICogIGlmIHRoZSBnaXZlbiBvbmUgaXMgZ3JlYXRlclxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICBpZiAodGhpcy5lcShvdGhlcikpIHJldHVybiAwO1xuICAgIHZhciB0aGlzTmVnID0gdGhpcy5pc05lZ2F0aXZlKCksXG4gICAgICAgIG90aGVyTmVnID0gb3RoZXIuaXNOZWdhdGl2ZSgpO1xuICAgIGlmICh0aGlzTmVnICYmICFvdGhlck5lZykgcmV0dXJuIC0xO1xuICAgIGlmICghdGhpc05lZyAmJiBvdGhlck5lZykgcmV0dXJuIDE7IC8vIEF0IHRoaXMgcG9pbnQgdGhlIHNpZ24gYml0cyBhcmUgdGhlIHNhbWVcbiAgXG4gICAgaWYgKCF0aGlzLnVuc2lnbmVkKSByZXR1cm4gdGhpcy5zdWIob3RoZXIpLmlzTmVnYXRpdmUoKSA/IC0xIDogMTsgLy8gQm90aCBhcmUgcG9zaXRpdmUgaWYgYXQgbGVhc3Qgb25lIGlzIHVuc2lnbmVkXG4gIFxuICAgIHJldHVybiBvdGhlci5oaWdoID4+PiAwID4gdGhpcy5oaWdoID4+PiAwIHx8IG90aGVyLmhpZ2ggPT09IHRoaXMuaGlnaCAmJiBvdGhlci5sb3cgPj4+IDAgPiB0aGlzLmxvdyA+Pj4gMCA/IC0xIDogMTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbXBhcmVzIHRoaXMgTG9uZydzIHZhbHVlIHdpdGggdGhlIHNwZWNpZmllZCdzLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI2NvbXBhcmV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciB2YWx1ZVxuICAgKiBAcmV0dXJucyB7bnVtYmVyfSAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLCAxIGlmIHRoZSB0aGlzIGlzIGdyZWF0ZXIgYW5kIC0xXG4gICAqICBpZiB0aGUgZ2l2ZW4gb25lIGlzIGdyZWF0ZXJcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb21wID0gTG9uZ1Byb3RvdHlwZS5jb21wYXJlO1xuICAvKipcbiAgICogTmVnYXRlcyB0aGlzIExvbmcncyB2YWx1ZS5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IE5lZ2F0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubmVnYXRlID0gZnVuY3Rpb24gbmVnYXRlKCkge1xuICAgIGlmICghdGhpcy51bnNpZ25lZCAmJiB0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBNSU5fVkFMVUU7XG4gICAgcmV0dXJuIHRoaXMubm90KCkuYWRkKE9ORSk7XG4gIH07XG4gIC8qKlxuICAgKiBOZWdhdGVzIHRoaXMgTG9uZydzIHZhbHVlLiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI25lZ2F0ZX0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcmV0dXJucyB7IUxvbmd9IE5lZ2F0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm5lZyA9IExvbmdQcm90b3R5cGUubmVnYXRlO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgc3VtIG9mIHRoaXMgYW5kIHRoZSBzcGVjaWZpZWQgTG9uZy5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IGFkZGVuZCBBZGRlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBTdW1cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uIGFkZChhZGRlbmQpIHtcbiAgICBpZiAoIWlzTG9uZyhhZGRlbmQpKSBhZGRlbmQgPSBmcm9tVmFsdWUoYWRkZW5kKTsgLy8gRGl2aWRlIGVhY2ggbnVtYmVyIGludG8gNCBjaHVua3Mgb2YgMTYgYml0cywgYW5kIHRoZW4gc3VtIHRoZSBjaHVua3MuXG4gIFxuICAgIHZhciBhNDggPSB0aGlzLmhpZ2ggPj4+IDE2O1xuICAgIHZhciBhMzIgPSB0aGlzLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGExNiA9IHRoaXMubG93ID4+PiAxNjtcbiAgICB2YXIgYTAwID0gdGhpcy5sb3cgJiAweEZGRkY7XG4gICAgdmFyIGI0OCA9IGFkZGVuZC5oaWdoID4+PiAxNjtcbiAgICB2YXIgYjMyID0gYWRkZW5kLmhpZ2ggJiAweEZGRkY7XG4gICAgdmFyIGIxNiA9IGFkZGVuZC5sb3cgPj4+IDE2O1xuICAgIHZhciBiMDAgPSBhZGRlbmQubG93ICYgMHhGRkZGO1xuICAgIHZhciBjNDggPSAwLFxuICAgICAgICBjMzIgPSAwLFxuICAgICAgICBjMTYgPSAwLFxuICAgICAgICBjMDAgPSAwO1xuICAgIGMwMCArPSBhMDAgKyBiMDA7XG4gICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgYzAwICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTE2ICsgYjE2O1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEzMiArIGIzMjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGM0OCArPSBhNDggKyBiNDg7XG4gICAgYzQ4ICY9IDB4RkZGRjtcbiAgICByZXR1cm4gZnJvbUJpdHMoYzE2IDw8IDE2IHwgYzAwLCBjNDggPDwgMTYgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBzdWJ0cmFoZW5kIFN1YnRyYWhlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbiBzdWJ0cmFjdChzdWJ0cmFoZW5kKSB7XG4gICAgaWYgKCFpc0xvbmcoc3VidHJhaGVuZCkpIHN1YnRyYWhlbmQgPSBmcm9tVmFsdWUoc3VidHJhaGVuZCk7XG4gICAgcmV0dXJuIHRoaXMuYWRkKHN1YnRyYWhlbmQubmVnKCkpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgZGlmZmVyZW5jZSBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc3VidHJhY3R9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBzdWJ0cmFoZW5kIFN1YnRyYWhlbmRcbiAgICogQHJldHVybnMgeyFMb25nfSBEaWZmZXJlbmNlXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc3ViID0gTG9uZ1Byb3RvdHlwZS5zdWJ0cmFjdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2R1Y3Qgb2YgdGhpcyBhbmQgdGhlIHNwZWNpZmllZCBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gbXVsdGlwbGllciBNdWx0aXBsaWVyXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUHJvZHVjdFxuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbiBtdWx0aXBseShtdWx0aXBsaWVyKSB7XG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiB0aGlzO1xuICAgIGlmICghaXNMb25nKG11bHRpcGxpZXIpKSBtdWx0aXBsaWVyID0gZnJvbVZhbHVlKG11bHRpcGxpZXIpOyAvLyB1c2Ugd2FzbSBzdXBwb3J0IGlmIHByZXNlbnRcbiAgXG4gICAgaWYgKHdhc20pIHtcbiAgICAgIHZhciBsb3cgPSB3YXNtW1wibXVsXCJdKHRoaXMubG93LCB0aGlzLmhpZ2gsIG11bHRpcGxpZXIubG93LCBtdWx0aXBsaWVyLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgaWYgKG11bHRpcGxpZXIuaXNaZXJvKCkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIGlmICh0aGlzLmVxKE1JTl9WQUxVRSkpIHJldHVybiBtdWx0aXBsaWVyLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICAgIGlmIChtdWx0aXBsaWVyLmVxKE1JTl9WQUxVRSkpIHJldHVybiB0aGlzLmlzT2RkKCkgPyBNSU5fVkFMVUUgOiBaRVJPO1xuICBcbiAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgIGlmIChtdWx0aXBsaWVyLmlzTmVnYXRpdmUoKSkgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIubmVnKCkpO2Vsc2UgcmV0dXJuIHRoaXMubmVnKCkubXVsKG11bHRpcGxpZXIpLm5lZygpO1xuICAgIH0gZWxzZSBpZiAobXVsdGlwbGllci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLm11bChtdWx0aXBsaWVyLm5lZygpKS5uZWcoKTsgLy8gSWYgYm90aCBsb25ncyBhcmUgc21hbGwsIHVzZSBmbG9hdCBtdWx0aXBsaWNhdGlvblxuICBcbiAgXG4gICAgaWYgKHRoaXMubHQoVFdPX1BXUl8yNCkgJiYgbXVsdGlwbGllci5sdChUV09fUFdSXzI0KSkgcmV0dXJuIGZyb21OdW1iZXIodGhpcy50b051bWJlcigpICogbXVsdGlwbGllci50b051bWJlcigpLCB0aGlzLnVuc2lnbmVkKTsgLy8gRGl2aWRlIGVhY2ggbG9uZyBpbnRvIDQgY2h1bmtzIG9mIDE2IGJpdHMsIGFuZCB0aGVuIGFkZCB1cCA0eDQgcHJvZHVjdHMuXG4gICAgLy8gV2UgY2FuIHNraXAgcHJvZHVjdHMgdGhhdCB3b3VsZCBvdmVyZmxvdy5cbiAgXG4gICAgdmFyIGE0OCA9IHRoaXMuaGlnaCA+Pj4gMTY7XG4gICAgdmFyIGEzMiA9IHRoaXMuaGlnaCAmIDB4RkZGRjtcbiAgICB2YXIgYTE2ID0gdGhpcy5sb3cgPj4+IDE2O1xuICAgIHZhciBhMDAgPSB0aGlzLmxvdyAmIDB4RkZGRjtcbiAgICB2YXIgYjQ4ID0gbXVsdGlwbGllci5oaWdoID4+PiAxNjtcbiAgICB2YXIgYjMyID0gbXVsdGlwbGllci5oaWdoICYgMHhGRkZGO1xuICAgIHZhciBiMTYgPSBtdWx0aXBsaWVyLmxvdyA+Pj4gMTY7XG4gICAgdmFyIGIwMCA9IG11bHRpcGxpZXIubG93ICYgMHhGRkZGO1xuICAgIHZhciBjNDggPSAwLFxuICAgICAgICBjMzIgPSAwLFxuICAgICAgICBjMTYgPSAwLFxuICAgICAgICBjMDAgPSAwO1xuICAgIGMwMCArPSBhMDAgKiBiMDA7XG4gICAgYzE2ICs9IGMwMCA+Pj4gMTY7XG4gICAgYzAwICY9IDB4RkZGRjtcbiAgICBjMTYgKz0gYTE2ICogYjAwO1xuICAgIGMzMiArPSBjMTYgPj4+IDE2O1xuICAgIGMxNiAmPSAweEZGRkY7XG4gICAgYzE2ICs9IGEwMCAqIGIxNjtcbiAgICBjMzIgKz0gYzE2ID4+PiAxNjtcbiAgICBjMTYgJj0gMHhGRkZGO1xuICAgIGMzMiArPSBhMzIgKiBiMDA7XG4gICAgYzQ4ICs9IGMzMiA+Pj4gMTY7XG4gICAgYzMyICY9IDB4RkZGRjtcbiAgICBjMzIgKz0gYTE2ICogYjE2O1xuICAgIGM0OCArPSBjMzIgPj4+IDE2O1xuICAgIGMzMiAmPSAweEZGRkY7XG4gICAgYzMyICs9IGEwMCAqIGIzMjtcbiAgICBjNDggKz0gYzMyID4+PiAxNjtcbiAgICBjMzIgJj0gMHhGRkZGO1xuICAgIGM0OCArPSBhNDggKiBiMDAgKyBhMzIgKiBiMTYgKyBhMTYgKiBiMzIgKyBhMDAgKiBiNDg7XG4gICAgYzQ4ICY9IDB4RkZGRjtcbiAgICByZXR1cm4gZnJvbUJpdHMoYzE2IDw8IDE2IHwgYzAwLCBjNDggPDwgMTYgfCBjMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgcHJvZHVjdCBvZiB0aGlzIGFuZCB0aGUgc3BlY2lmaWVkIExvbmcuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbXVsdGlwbHl9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBtdWx0aXBsaWVyIE11bHRpcGxpZXJcbiAgICogQHJldHVybnMgeyFMb25nfSBQcm9kdWN0XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubXVsID0gTG9uZ1Byb3RvdHlwZS5tdWx0aXBseTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIHNwZWNpZmllZC4gVGhlIHJlc3VsdCBpcyBzaWduZWQgaWYgdGhpcyBMb25nIGlzIHNpZ25lZCBvclxuICAgKiAgdW5zaWduZWQgaWYgdGhpcyBMb25nIGlzIHVuc2lnbmVkLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUXVvdGllbnRcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmRpdmlkZSA9IGZ1bmN0aW9uIGRpdmlkZShkaXZpc29yKSB7XG4gICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7XG4gICAgaWYgKGRpdmlzb3IuaXNaZXJvKCkpIHRocm93IEVycm9yKCdkaXZpc2lvbiBieSB6ZXJvJyk7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgLy8gZ3VhcmQgYWdhaW5zdCBzaWduZWQgZGl2aXNpb24gb3ZlcmZsb3c6IHRoZSBsYXJnZXN0XG4gICAgICAvLyBuZWdhdGl2ZSBudW1iZXIgLyAtMSB3b3VsZCBiZSAxIGxhcmdlciB0aGFuIHRoZSBsYXJnZXN0XG4gICAgICAvLyBwb3NpdGl2ZSBudW1iZXIsIGR1ZSB0byB0d28ncyBjb21wbGVtZW50LlxuICAgICAgaWYgKCF0aGlzLnVuc2lnbmVkICYmIHRoaXMuaGlnaCA9PT0gLTB4ODAwMDAwMDAgJiYgZGl2aXNvci5sb3cgPT09IC0xICYmIGRpdmlzb3IuaGlnaCA9PT0gLTEpIHtcbiAgICAgICAgLy8gYmUgY29uc2lzdGVudCB3aXRoIG5vbi13YXNtIGNvZGUgcGF0aFxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgXG4gICAgICB2YXIgbG93ID0gKHRoaXMudW5zaWduZWQgPyB3YXNtW1wiZGl2X3VcIl0gOiB3YXNtW1wiZGl2X3NcIl0pKHRoaXMubG93LCB0aGlzLmhpZ2gsIGRpdmlzb3IubG93LCBkaXZpc29yLmhpZ2gpO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKGxvdywgd2FzbVtcImdldF9oaWdoXCJdKCksIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgaWYgKHRoaXMuaXNaZXJvKCkpIHJldHVybiB0aGlzLnVuc2lnbmVkID8gVVpFUk8gOiBaRVJPO1xuICAgIHZhciBhcHByb3gsIHJlbSwgcmVzO1xuICBcbiAgICBpZiAoIXRoaXMudW5zaWduZWQpIHtcbiAgICAgIC8vIFRoaXMgc2VjdGlvbiBpcyBvbmx5IHJlbGV2YW50IGZvciBzaWduZWQgbG9uZ3MgYW5kIGlzIGRlcml2ZWQgZnJvbSB0aGVcbiAgICAgIC8vIGNsb3N1cmUgbGlicmFyeSBhcyBhIHdob2xlLlxuICAgICAgaWYgKHRoaXMuZXEoTUlOX1ZBTFVFKSkge1xuICAgICAgICBpZiAoZGl2aXNvci5lcShPTkUpIHx8IGRpdmlzb3IuZXEoTkVHX09ORSkpIHJldHVybiBNSU5fVkFMVUU7IC8vIHJlY2FsbCB0aGF0IC1NSU5fVkFMVUUgPT0gTUlOX1ZBTFVFXG4gICAgICAgIGVsc2UgaWYgKGRpdmlzb3IuZXEoTUlOX1ZBTFVFKSkgcmV0dXJuIE9ORTtlbHNlIHtcbiAgICAgICAgICAvLyBBdCB0aGlzIHBvaW50LCB3ZSBoYXZlIHxvdGhlcnwgPj0gMiwgc28gfHRoaXMvb3RoZXJ8IDwgfE1JTl9WQUxVRXwuXG4gICAgICAgICAgdmFyIGhhbGZUaGlzID0gdGhpcy5zaHIoMSk7XG4gICAgICAgICAgYXBwcm94ID0gaGFsZlRoaXMuZGl2KGRpdmlzb3IpLnNobCgxKTtcbiAgXG4gICAgICAgICAgaWYgKGFwcHJveC5lcShaRVJPKSkge1xuICAgICAgICAgICAgcmV0dXJuIGRpdmlzb3IuaXNOZWdhdGl2ZSgpID8gT05FIDogTkVHX09ORTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVtID0gdGhpcy5zdWIoZGl2aXNvci5tdWwoYXBwcm94KSk7XG4gICAgICAgICAgICByZXMgPSBhcHByb3guYWRkKHJlbS5kaXYoZGl2aXNvcikpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5lcShNSU5fVkFMVUUpKSByZXR1cm4gdGhpcy51bnNpZ25lZCA/IFVaRVJPIDogWkVSTztcbiAgXG4gICAgICBpZiAodGhpcy5pc05lZ2F0aXZlKCkpIHtcbiAgICAgICAgaWYgKGRpdmlzb3IuaXNOZWdhdGl2ZSgpKSByZXR1cm4gdGhpcy5uZWcoKS5kaXYoZGl2aXNvci5uZWcoKSk7XG4gICAgICAgIHJldHVybiB0aGlzLm5lZygpLmRpdihkaXZpc29yKS5uZWcoKTtcbiAgICAgIH0gZWxzZSBpZiAoZGl2aXNvci5pc05lZ2F0aXZlKCkpIHJldHVybiB0aGlzLmRpdihkaXZpc29yLm5lZygpKS5uZWcoKTtcbiAgXG4gICAgICByZXMgPSBaRVJPO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUaGUgYWxnb3JpdGhtIGJlbG93IGhhcyBub3QgYmVlbiBtYWRlIGZvciB1bnNpZ25lZCBsb25ncy4gSXQncyB0aGVyZWZvcmVcbiAgICAgIC8vIHJlcXVpcmVkIHRvIHRha2Ugc3BlY2lhbCBjYXJlIG9mIHRoZSBNU0IgcHJpb3IgdG8gcnVubmluZyBpdC5cbiAgICAgIGlmICghZGl2aXNvci51bnNpZ25lZCkgZGl2aXNvciA9IGRpdmlzb3IudG9VbnNpZ25lZCgpO1xuICAgICAgaWYgKGRpdmlzb3IuZ3QodGhpcykpIHJldHVybiBVWkVSTztcbiAgICAgIGlmIChkaXZpc29yLmd0KHRoaXMuc2hydSgxKSkpIC8vIDE1ID4+PiAxID0gNyA7IHdpdGggZGl2aXNvciA9IDggOyB0cnVlXG4gICAgICAgIHJldHVybiBVT05FO1xuICAgICAgcmVzID0gVVpFUk87XG4gICAgfSAvLyBSZXBlYXQgdGhlIGZvbGxvd2luZyB1bnRpbCB0aGUgcmVtYWluZGVyIGlzIGxlc3MgdGhhbiBvdGhlcjogIGZpbmQgYVxuICAgIC8vIGZsb2F0aW5nLXBvaW50IHRoYXQgYXBwcm94aW1hdGVzIHJlbWFpbmRlciAvIG90aGVyICpmcm9tIGJlbG93KiwgYWRkIHRoaXNcbiAgICAvLyBpbnRvIHRoZSByZXN1bHQsIGFuZCBzdWJ0cmFjdCBpdCBmcm9tIHRoZSByZW1haW5kZXIuICBJdCBpcyBjcml0aWNhbCB0aGF0XG4gICAgLy8gdGhlIGFwcHJveGltYXRlIHZhbHVlIGlzIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgcmVhbCB2YWx1ZSBzbyB0aGF0IHRoZVxuICAgIC8vIHJlbWFpbmRlciBuZXZlciBiZWNvbWVzIG5lZ2F0aXZlLlxuICBcbiAgXG4gICAgcmVtID0gdGhpcztcbiAgXG4gICAgd2hpbGUgKHJlbS5ndGUoZGl2aXNvcikpIHtcbiAgICAgIC8vIEFwcHJveGltYXRlIHRoZSByZXN1bHQgb2YgZGl2aXNpb24uIFRoaXMgbWF5IGJlIGEgbGl0dGxlIGdyZWF0ZXIgb3JcbiAgICAgIC8vIHNtYWxsZXIgdGhhbiB0aGUgYWN0dWFsIHZhbHVlLlxuICAgICAgYXBwcm94ID0gTWF0aC5tYXgoMSwgTWF0aC5mbG9vcihyZW0udG9OdW1iZXIoKSAvIGRpdmlzb3IudG9OdW1iZXIoKSkpOyAvLyBXZSB3aWxsIHR3ZWFrIHRoZSBhcHByb3hpbWF0ZSByZXN1bHQgYnkgY2hhbmdpbmcgaXQgaW4gdGhlIDQ4LXRoIGRpZ2l0IG9yXG4gICAgICAvLyB0aGUgc21hbGxlc3Qgbm9uLWZyYWN0aW9uYWwgZGlnaXQsIHdoaWNoZXZlciBpcyBsYXJnZXIuXG4gIFxuICAgICAgdmFyIGxvZzIgPSBNYXRoLmNlaWwoTWF0aC5sb2coYXBwcm94KSAvIE1hdGguTE4yKSxcbiAgICAgICAgICBkZWx0YSA9IGxvZzIgPD0gNDggPyAxIDogcG93X2RibCgyLCBsb2cyIC0gNDgpLFxuICAgICAgICAgIC8vIERlY3JlYXNlIHRoZSBhcHByb3hpbWF0aW9uIHVudGlsIGl0IGlzIHNtYWxsZXIgdGhhbiB0aGUgcmVtYWluZGVyLiAgTm90ZVxuICAgICAgLy8gdGhhdCBpZiBpdCBpcyB0b28gbGFyZ2UsIHRoZSBwcm9kdWN0IG92ZXJmbG93cyBhbmQgaXMgbmVnYXRpdmUuXG4gICAgICBhcHByb3hSZXMgPSBmcm9tTnVtYmVyKGFwcHJveCksXG4gICAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bChkaXZpc29yKTtcbiAgXG4gICAgICB3aGlsZSAoYXBwcm94UmVtLmlzTmVnYXRpdmUoKSB8fCBhcHByb3hSZW0uZ3QocmVtKSkge1xuICAgICAgICBhcHByb3ggLT0gZGVsdGE7XG4gICAgICAgIGFwcHJveFJlcyA9IGZyb21OdW1iZXIoYXBwcm94LCB0aGlzLnVuc2lnbmVkKTtcbiAgICAgICAgYXBwcm94UmVtID0gYXBwcm94UmVzLm11bChkaXZpc29yKTtcbiAgICAgIH0gLy8gV2Uga25vdyB0aGUgYW5zd2VyIGNhbid0IGJlIHplcm8uLi4gYW5kIGFjdHVhbGx5LCB6ZXJvIHdvdWxkIGNhdXNlXG4gICAgICAvLyBpbmZpbml0ZSByZWN1cnNpb24gc2luY2Ugd2Ugd291bGQgbWFrZSBubyBwcm9ncmVzcy5cbiAgXG4gIFxuICAgICAgaWYgKGFwcHJveFJlcy5pc1plcm8oKSkgYXBwcm94UmVzID0gT05FO1xuICAgICAgcmVzID0gcmVzLmFkZChhcHByb3hSZXMpO1xuICAgICAgcmVtID0gcmVtLnN1YihhcHByb3hSZW0pO1xuICAgIH1cbiAgXG4gICAgcmV0dXJuIHJlcztcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIGRpdmlkZWQgYnkgdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNkaXZpZGV9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBRdW90aWVudFxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLmRpdiA9IExvbmdQcm90b3R5cGUuZGl2aWRlO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm1vZHVsbyA9IGZ1bmN0aW9uIG1vZHVsbyhkaXZpc29yKSB7XG4gICAgaWYgKCFpc0xvbmcoZGl2aXNvcikpIGRpdmlzb3IgPSBmcm9tVmFsdWUoZGl2aXNvcik7IC8vIHVzZSB3YXNtIHN1cHBvcnQgaWYgcHJlc2VudFxuICBcbiAgICBpZiAod2FzbSkge1xuICAgICAgdmFyIGxvdyA9ICh0aGlzLnVuc2lnbmVkID8gd2FzbVtcInJlbV91XCJdIDogd2FzbVtcInJlbV9zXCJdKSh0aGlzLmxvdywgdGhpcy5oaWdoLCBkaXZpc29yLmxvdywgZGl2aXNvci5oaWdoKTtcbiAgICAgIHJldHVybiBmcm9tQml0cyhsb3csIHdhc21bXCJnZXRfaGlnaFwiXSgpLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIHJldHVybiB0aGlzLnN1Yih0aGlzLmRpdihkaXZpc29yKS5tdWwoZGl2aXNvcikpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgbW9kdWxvIHRoZSBzcGVjaWZpZWQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjbW9kdWxvfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gZGl2aXNvciBEaXZpc29yXG4gICAqIEByZXR1cm5zIHshTG9uZ30gUmVtYWluZGVyXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUubW9kID0gTG9uZ1Byb3RvdHlwZS5tb2R1bG87XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyBtb2R1bG8gdGhlIHNwZWNpZmllZC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNtb2R1bG99LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBkaXZpc29yIERpdmlzb3JcbiAgICogQHJldHVybnMgeyFMb25nfSBSZW1haW5kZXJcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJlbSA9IExvbmdQcm90b3R5cGUubW9kdWxvO1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBOT1Qgb2YgdGhpcyBMb25nLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLm5vdCA9IGZ1bmN0aW9uIG5vdCgpIHtcbiAgICByZXR1cm4gZnJvbUJpdHMofnRoaXMubG93LCB+dGhpcy5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcyBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY291bnRMZWFkaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudExlYWRpbmdaZXJvcygpIHtcbiAgICByZXR1cm4gdGhpcy5oaWdoID8gTWF0aC5jbHozMih0aGlzLmhpZ2gpIDogTWF0aC5jbHozMih0aGlzLmxvdykgKyAzMjtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgY291bnQgbGVhZGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudExlYWRpbmdaZXJvc30uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0geyFMb25nfVxuICAgKiBAcmV0dXJucyB7IW51bWJlcn1cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5jbHogPSBMb25nUHJvdG90eXBlLmNvdW50TGVhZGluZ1plcm9zO1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCB0cmFpbGluZyB6ZXJvcyBvZiB0aGlzIExvbmcuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3MgPSBmdW5jdGlvbiBjb3VudFRyYWlsaW5nWmVyb3MoKSB7XG4gICAgcmV0dXJuIHRoaXMubG93ID8gY3R6MzIodGhpcy5sb3cpIDogY3R6MzIodGhpcy5oaWdoKSArIDMyO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyBjb3VudCB0cmFpbGluZyB6ZXJvcy4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNjb3VudFRyYWlsaW5nWmVyb3N9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFudW1iZXJ9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuY3R6ID0gTG9uZ1Byb3RvdHlwZS5jb3VudFRyYWlsaW5nWmVyb3M7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIEFORCBvZiB0aGlzIExvbmcgYW5kIHRoZSBzcGVjaWZpZWQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHshTG9uZ3xudW1iZXJ8c3RyaW5nfSBvdGhlciBPdGhlciBMb25nXG4gICAqIEByZXR1cm5zIHshTG9uZ31cbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLmFuZCA9IGZ1bmN0aW9uIGFuZChvdGhlcikge1xuICAgIGlmICghaXNMb25nKG90aGVyKSkgb3RoZXIgPSBmcm9tVmFsdWUob3RoZXIpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyAmIG90aGVyLmxvdywgdGhpcy5oaWdoICYgb3RoZXIuaGlnaCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBiaXR3aXNlIE9SIG9mIHRoaXMgTG9uZyBhbmQgdGhlIHNwZWNpZmllZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0geyFMb25nfG51bWJlcnxzdHJpbmd9IG90aGVyIE90aGVyIExvbmdcbiAgICogQHJldHVybnMgeyFMb25nfVxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLm9yID0gZnVuY3Rpb24gb3Iob3RoZXIpIHtcbiAgICBpZiAoIWlzTG9uZyhvdGhlcikpIG90aGVyID0gZnJvbVZhbHVlKG90aGVyKTtcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgfCBvdGhlci5sb3csIHRoaXMuaGlnaCB8IG90aGVyLmhpZ2gsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGUgYml0d2lzZSBYT1Igb2YgdGhpcyBMb25nIGFuZCB0aGUgZ2l2ZW4gb25lLlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7IUxvbmd8bnVtYmVyfHN0cmluZ30gb3RoZXIgT3RoZXIgTG9uZ1xuICAgKiBAcmV0dXJucyB7IUxvbmd9XG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUueG9yID0gZnVuY3Rpb24geG9yKG90aGVyKSB7XG4gICAgaWYgKCFpc0xvbmcob3RoZXIpKSBvdGhlciA9IGZyb21WYWx1ZShvdGhlcik7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IF4gb3RoZXIubG93LCB0aGlzLmhpZ2ggXiBvdGhlci5oaWdoLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBzaGlmdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdExlZnQgPSBmdW5jdGlvbiBzaGlmdExlZnQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7ZWxzZSBpZiAobnVtQml0cyA8IDMyKSByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgbnVtQml0cywgdGhpcy5oaWdoIDw8IG51bUJpdHMgfCB0aGlzLmxvdyA+Pj4gMzIgLSBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtlbHNlIHJldHVybiBmcm9tQml0cygwLCB0aGlzLmxvdyA8PCBudW1CaXRzIC0gMzIsIHRoaXMudW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIHNoaWZ0ZWQgdG8gdGhlIGxlZnQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdExlZnR9LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBTaGlmdGVkIExvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGwgPSBMb25nUHJvdG90eXBlLnNoaWZ0TGVmdDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyBhcml0aG1ldGljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0ID0gZnVuY3Rpb24gc2hpZnRSaWdodChudW1CaXRzKSB7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztlbHNlIGlmIChudW1CaXRzIDwgMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmxvdyA+Pj4gbnVtQml0cyB8IHRoaXMuaGlnaCA8PCAzMiAtIG51bUJpdHMsIHRoaXMuaGlnaCA+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtlbHNlIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPj4gbnVtQml0cyAtIDMyLCB0aGlzLmhpZ2ggPj0gMCA/IDAgOiAtMSwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgYXJpdGhtZXRpY2FsbHkgc2hpZnRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNzaGlmdFJpZ2h0fS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hyID0gTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0O1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LlxuICAgKiBAdGhpcyB7IUxvbmd9XG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS5zaGlmdFJpZ2h0VW5zaWduZWQgPSBmdW5jdGlvbiBzaGlmdFJpZ2h0VW5zaWduZWQobnVtQml0cykge1xuICAgIGlmIChpc0xvbmcobnVtQml0cykpIG51bUJpdHMgPSBudW1CaXRzLnRvSW50KCk7XG4gICAgaWYgKChudW1CaXRzICY9IDYzKSA9PT0gMCkgcmV0dXJuIHRoaXM7XG4gICAgaWYgKG51bUJpdHMgPCAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93ID4+PiBudW1CaXRzIHwgdGhpcy5oaWdoIDw8IDMyIC0gbnVtQml0cywgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIDAsIHRoaXMudW5zaWduZWQpO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPj4+IG51bUJpdHMgLSAzMiwgMCwgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgbG9naWNhbGx5IHNoaWZ0ZWQgdG8gdGhlIHJpZ2h0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjc2hpZnRSaWdodFVuc2lnbmVkfS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfCFMb25nfSBudW1CaXRzIE51bWJlciBvZiBiaXRzXG4gICAqIEByZXR1cm5zIHshTG9uZ30gU2hpZnRlZCBMb25nXG4gICAqL1xuICBcbiAgXG4gIExvbmdQcm90b3R5cGUuc2hydSA9IExvbmdQcm90b3R5cGUuc2hpZnRSaWdodFVuc2lnbmVkO1xuICAvKipcbiAgICogUmV0dXJucyB0aGlzIExvbmcgd2l0aCBiaXRzIGxvZ2ljYWxseSBzaGlmdGVkIHRvIHRoZSByaWdodCBieSB0aGUgZ2l2ZW4gYW1vdW50LiBUaGlzIGlzIGFuIGFsaWFzIG9mIHtAbGluayBMb25nI3NoaWZ0UmlnaHRVbnNpZ25lZH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNoaWZ0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUuc2hyX3UgPSBMb25nUHJvdG90eXBlLnNoaWZ0UmlnaHRVbnNpZ25lZDtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHBhcmFtIHtudW1iZXJ8IUxvbmd9IG51bUJpdHMgTnVtYmVyIG9mIGJpdHNcbiAgICogQHJldHVybnMgeyFMb25nfSBSb3RhdGVkIExvbmdcbiAgICovXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGF0ZUxlZnQgPSBmdW5jdGlvbiByb3RhdGVMZWZ0KG51bUJpdHMpIHtcbiAgICB2YXIgYjtcbiAgICBpZiAoaXNMb25nKG51bUJpdHMpKSBudW1CaXRzID0gbnVtQml0cy50b0ludCgpO1xuICAgIGlmICgobnVtQml0cyAmPSA2MykgPT09IDApIHJldHVybiB0aGlzO1xuICAgIGlmIChudW1CaXRzID09PSAzMikgcmV0dXJuIGZyb21CaXRzKHRoaXMuaGlnaCwgdGhpcy5sb3csIHRoaXMudW5zaWduZWQpO1xuICBcbiAgICBpZiAobnVtQml0cyA8IDMyKSB7XG4gICAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93IDw8IG51bUJpdHMgfCB0aGlzLmhpZ2ggPj4+IGIsIHRoaXMuaGlnaCA8PCBudW1CaXRzIHwgdGhpcy5sb3cgPj4+IGIsIHRoaXMudW5zaWduZWQpO1xuICAgIH1cbiAgXG4gICAgbnVtQml0cyAtPSAzMjtcbiAgICBiID0gMzIgLSBudW1CaXRzO1xuICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPDwgbnVtQml0cyB8IHRoaXMubG93ID4+PiBiLCB0aGlzLmxvdyA8PCBudW1CaXRzIHwgdGhpcy5oaWdoID4+PiBiLCB0aGlzLnVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFJldHVybnMgdGhpcyBMb25nIHdpdGggYml0cyByb3RhdGVkIHRvIHRoZSBsZWZ0IGJ5IHRoZSBnaXZlbiBhbW91bnQuIFRoaXMgaXMgYW4gYWxpYXMgb2Yge0BsaW5rIExvbmcjcm90YXRlTGVmdH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdGwgPSBMb25nUHJvdG90eXBlLnJvdGF0ZUxlZnQ7XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIExvbmdQcm90b3R5cGUucm90YXRlUmlnaHQgPSBmdW5jdGlvbiByb3RhdGVSaWdodChudW1CaXRzKSB7XG4gICAgdmFyIGI7XG4gICAgaWYgKGlzTG9uZyhudW1CaXRzKSkgbnVtQml0cyA9IG51bUJpdHMudG9JbnQoKTtcbiAgICBpZiAoKG51bUJpdHMgJj0gNjMpID09PSAwKSByZXR1cm4gdGhpcztcbiAgICBpZiAobnVtQml0cyA9PT0gMzIpIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2gsIHRoaXMubG93LCB0aGlzLnVuc2lnbmVkKTtcbiAgXG4gICAgaWYgKG51bUJpdHMgPCAzMikge1xuICAgICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICAgIHJldHVybiBmcm9tQml0cyh0aGlzLmhpZ2ggPDwgYiB8IHRoaXMubG93ID4+PiBudW1CaXRzLCB0aGlzLmxvdyA8PCBiIHwgdGhpcy5oaWdoID4+PiBudW1CaXRzLCB0aGlzLnVuc2lnbmVkKTtcbiAgICB9XG4gIFxuICAgIG51bUJpdHMgLT0gMzI7XG4gICAgYiA9IDMyIC0gbnVtQml0cztcbiAgICByZXR1cm4gZnJvbUJpdHModGhpcy5sb3cgPDwgYiB8IHRoaXMuaGlnaCA+Pj4gbnVtQml0cywgdGhpcy5oaWdoIDw8IGIgfCB0aGlzLmxvdyA+Pj4gbnVtQml0cywgdGhpcy51bnNpZ25lZCk7XG4gIH07XG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoaXMgTG9uZyB3aXRoIGJpdHMgcm90YXRlZCB0byB0aGUgcmlnaHQgYnkgdGhlIGdpdmVuIGFtb3VudC4gVGhpcyBpcyBhbiBhbGlhcyBvZiB7QGxpbmsgTG9uZyNyb3RhdGVSaWdodH0uXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge251bWJlcnwhTG9uZ30gbnVtQml0cyBOdW1iZXIgb2YgYml0c1xuICAgKiBAcmV0dXJucyB7IUxvbmd9IFJvdGF0ZWQgTG9uZ1xuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnJvdHIgPSBMb25nUHJvdG90eXBlLnJvdGF0ZVJpZ2h0O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIHNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFNpZ25lZCBsb25nXG4gICAqL1xuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1NpZ25lZCA9IGZ1bmN0aW9uIHRvU2lnbmVkKCkge1xuICAgIGlmICghdGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93LCB0aGlzLmhpZ2gsIGZhbHNlKTtcbiAgfTtcbiAgLyoqXG4gICAqIENvbnZlcnRzIHRoaXMgTG9uZyB0byB1bnNpZ25lZC5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUxvbmd9IFVuc2lnbmVkIGxvbmdcbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b1Vuc2lnbmVkID0gZnVuY3Rpb24gdG9VbnNpZ25lZCgpIHtcbiAgICBpZiAodGhpcy51bnNpZ25lZCkgcmV0dXJuIHRoaXM7XG4gICAgcmV0dXJuIGZyb21CaXRzKHRoaXMubG93LCB0aGlzLmhpZ2gsIHRydWUpO1xuICB9O1xuICAvKipcbiAgICogQ29udmVydHMgdGhpcyBMb25nIHRvIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSBsZSBXaGV0aGVyIGxpdHRsZSBvciBiaWcgZW5kaWFuLCBkZWZhdWx0cyB0byBiaWcgZW5kaWFuXG4gICAqIEB0aGlzIHshTG9uZ31cbiAgICogQHJldHVybnMgeyFBcnJheS48bnVtYmVyPn0gQnl0ZSByZXByZXNlbnRhdGlvblxuICAgKi9cbiAgXG4gIFxuICBMb25nUHJvdG90eXBlLnRvQnl0ZXMgPSBmdW5jdGlvbiB0b0J5dGVzKGxlKSB7XG4gICAgcmV0dXJuIGxlID8gdGhpcy50b0J5dGVzTEUoKSA6IHRoaXMudG9CeXRlc0JFKCk7XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBMaXR0bGUgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzTEUgPSBmdW5jdGlvbiB0b0J5dGVzTEUoKSB7XG4gICAgdmFyIGhpID0gdGhpcy5oaWdoLFxuICAgICAgICBsbyA9IHRoaXMubG93O1xuICAgIHJldHVybiBbbG8gJiAweGZmLCBsbyA+Pj4gOCAmIDB4ZmYsIGxvID4+PiAxNiAmIDB4ZmYsIGxvID4+PiAyNCwgaGkgJiAweGZmLCBoaSA+Pj4gOCAmIDB4ZmYsIGhpID4+PiAxNiAmIDB4ZmYsIGhpID4+PiAyNF07XG4gIH07XG4gIC8qKlxuICAgKiBDb252ZXJ0cyB0aGlzIExvbmcgdG8gaXRzIGJpZyBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHRoaXMgeyFMb25nfVxuICAgKiBAcmV0dXJucyB7IUFycmF5LjxudW1iZXI+fSBCaWcgZW5kaWFuIGJ5dGUgcmVwcmVzZW50YXRpb25cbiAgICovXG4gIFxuICBcbiAgTG9uZ1Byb3RvdHlwZS50b0J5dGVzQkUgPSBmdW5jdGlvbiB0b0J5dGVzQkUoKSB7XG4gICAgdmFyIGhpID0gdGhpcy5oaWdoLFxuICAgICAgICBsbyA9IHRoaXMubG93O1xuICAgIHJldHVybiBbaGkgPj4+IDI0LCBoaSA+Pj4gMTYgJiAweGZmLCBoaSA+Pj4gOCAmIDB4ZmYsIGhpICYgMHhmZiwgbG8gPj4+IDI0LCBsbyA+Pj4gMTYgJiAweGZmLCBsbyA+Pj4gOCAmIDB4ZmYsIGxvICYgMHhmZl07XG4gIH07XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgTG9uZyBmcm9tIGl0cyBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgQnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IGxlIFdoZXRoZXIgbGl0dGxlIG9yIGJpZyBlbmRpYW4sIGRlZmF1bHRzIHRvIGJpZyBlbmRpYW5cbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXMgPSBmdW5jdGlvbiBmcm9tQnl0ZXMoYnl0ZXMsIHVuc2lnbmVkLCBsZSkge1xuICAgIHJldHVybiBsZSA/IExvbmcuZnJvbUJ5dGVzTEUoYnl0ZXMsIHVuc2lnbmVkKSA6IExvbmcuZnJvbUJ5dGVzQkUoYnl0ZXMsIHVuc2lnbmVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBMb25nIGZyb20gaXRzIGxpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvbi5cbiAgICogQHBhcmFtIHshQXJyYXkuPG51bWJlcj59IGJ5dGVzIExpdHRsZSBlbmRpYW4gYnl0ZSByZXByZXNlbnRhdGlvblxuICAgKiBAcGFyYW0ge2Jvb2xlYW49fSB1bnNpZ25lZCBXaGV0aGVyIHVuc2lnbmVkIG9yIG5vdCwgZGVmYXVsdHMgdG8gc2lnbmVkXG4gICAqIEByZXR1cm5zIHtMb25nfSBUaGUgY29ycmVzcG9uZGluZyBMb25nIHZhbHVlXG4gICAqL1xuICBcbiAgXG4gIExvbmcuZnJvbUJ5dGVzTEUgPSBmdW5jdGlvbiBmcm9tQnl0ZXNMRShieXRlcywgdW5zaWduZWQpIHtcbiAgICByZXR1cm4gbmV3IExvbmcoYnl0ZXNbMF0gfCBieXRlc1sxXSA8PCA4IHwgYnl0ZXNbMl0gPDwgMTYgfCBieXRlc1szXSA8PCAyNCwgYnl0ZXNbNF0gfCBieXRlc1s1XSA8PCA4IHwgYnl0ZXNbNl0gPDwgMTYgfCBieXRlc1s3XSA8PCAyNCwgdW5zaWduZWQpO1xuICB9O1xuICAvKipcbiAgICogQ3JlYXRlcyBhIExvbmcgZnJvbSBpdHMgYmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uLlxuICAgKiBAcGFyYW0geyFBcnJheS48bnVtYmVyPn0gYnl0ZXMgQmlnIGVuZGlhbiBieXRlIHJlcHJlc2VudGF0aW9uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbj19IHVuc2lnbmVkIFdoZXRoZXIgdW5zaWduZWQgb3Igbm90LCBkZWZhdWx0cyB0byBzaWduZWRcbiAgICogQHJldHVybnMge0xvbmd9IFRoZSBjb3JyZXNwb25kaW5nIExvbmcgdmFsdWVcbiAgICovXG4gIFxuICBcbiAgTG9uZy5mcm9tQnl0ZXNCRSA9IGZ1bmN0aW9uIGZyb21CeXRlc0JFKGJ5dGVzLCB1bnNpZ25lZCkge1xuICAgIHJldHVybiBuZXcgTG9uZyhieXRlc1s0XSA8PCAyNCB8IGJ5dGVzWzVdIDw8IDE2IHwgYnl0ZXNbNl0gPDwgOCB8IGJ5dGVzWzddLCBieXRlc1swXSA8PCAyNCB8IGJ5dGVzWzFdIDw8IDE2IHwgYnl0ZXNbMl0gPDwgOCB8IGJ5dGVzWzNdLCB1bnNpZ25lZCk7XG4gIH07XG4gIFxuICB2YXIgX2RlZmF1bHQgPSBMb25nO1xuICBleHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDtcbiAgcmV0dXJuIFwiZGVmYXVsdFwiIGluIGV4cG9ydHMgPyBleHBvcnRzLmRlZmF1bHQgOiBleHBvcnRzO1xufSkoe30pO1xuaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHsgcmV0dXJuIExvbmc7IH0pO1xuZWxzZSBpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKSBtb2R1bGUuZXhwb3J0cyA9IExvbmc7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbl9fd2VicGFja19yZXF1aXJlX18ubiA9IChtb2R1bGUpID0+IHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0KCkgPT4gKG1vZHVsZVsnZGVmYXVsdCddKSA6XG5cdFx0KCkgPT4gKG1vZHVsZSk7XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiXG5jb25zdCBhcGkgPSByZXF1aXJlKCdAdGVtcG9yYWxpby93b3JrZmxvdy9saWIvd29ya2VyLWludGVyZmFjZS5qcycpO1xuXG5hcGkub3ZlcnJpZGVHbG9iYWxzKCk7XG5cbmV4cG9ydHMuYXBpID0gYXBpO1xuXG5leHBvcnRzLmltcG9ydFdvcmtmbG93cyA9IGZ1bmN0aW9uIGltcG9ydFdvcmtmbG93cygpIHtcbiAgcmV0dXJuIHJlcXVpcmUoLyogd2VicGFja01vZGU6IFwiZWFnZXJcIiAqLyBcIi9Vc2Vycy9qb2huam9obnNvbi9kZXYvZ2xpZGVyLW1vbm9yZXBvL2FwcHMvdGVtcG9yYWwvc3JjL3dvcmtmbG93cy50c1wiKTtcbn1cblxuZXhwb3J0cy5pbXBvcnRJbnRlcmNlcHRvcnMgPSBmdW5jdGlvbiBpbXBvcnRJbnRlcmNlcHRvcnMoKSB7XG4gIHJldHVybiBbXG4gICAgXG4gIF07XG59XG4iXSwibmFtZXMiOlsicHJveHlBY3Rpdml0aWVzIiwiYWN0aXZpdHlJbml0aWFsUmV0cnlJbnRlcnZhbCIsImdyZWV0IiwiZG9QbGFubmVkVHhTdGVwIiwibWludFRlc3ROZnQiLCJleGVjdXRlU3RyYXRlZ3kiLCJzdGFydFRvQ2xvc2VUaW1lb3V0IiwiaGVhcnRiZWF0VGltZW91dCIsInJldHJ5IiwiaW5pdGlhbEludGVydmFsIiwiYmFja29mZkNvZWZmaWNpZW50IiwibWF4aW11bUF0dGVtcHRzIiwibWF4aW11bUludGVydmFsIiwibm9uUmV0cnlhYmxlRXJyb3JUeXBlcyIsInJlYmFsYW5jZVdvcmtmbG93IiwicmViYWxhbmNlQXJncyIsImNvbnNvbGUiLCJsb2ciLCJzd2FwUmVzIiwic3RyYXRlZ3lJbnN0YW5jZUlkIiwic3VjY2VzcyJdLCJzb3VyY2VSb290IjoiIn0=