// api.ts
import express, { Request, Response } from "express";
import { z } from "zod";
import { spawn } from "child_process";
// import { apiConfig } from "./api-config";
import { logger } from "./logger";
// import env from "./env"; // TODO(johnrjj) switch config to use env. requires a little refactoring, punting for now
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(cors());

app.post("/healthz", async (req, res) => {
    res.json({
        status: "OK",
    });
})

// submit order to fairychain

// refresh recent fairychain orders and submit to cowswap

// Define the input validation schema using Zod
const inputSchema = z
  .object({
    assets: z.array(z.string()),
    initialQuantitiesUsd: z.array(z.number()),
    targetDistributionUsd: z.array(z.number()),
    swapCosts: z.record(z.tuple([z.string(), z.string()]), z.number()),
    usdValues: z.record(z.string(), z.number()),
  })
  .refine(
    (data) =>
      data.initialQuantitiesUsd.length === data.assets.length &&
      data.targetDistributionUsd.length === data.assets.length,
    {
      message: "Input arrays must have the same length",
    }
  );

// // API endpoint for optimizing rebalance
// app.post("/optimize-rebalance", (req: Request, res: Response) => {
//   try {
//     // Validate the input data against the schema
//     const validatedData = inputSchema.parse(req.body);

//     // Prepare the input data as a single JSON string argument for the Python script
//     const inputDataArg = JSON.stringify(validatedData);

//     // validatedData.

//     // Spawn a new process to run the Python script
//     const pythonProcess = spawn("python3", [
//       apiConfig.pythonScriptPath,
//       inputDataArg,
//     ]);

//     let pythonOutput = "";

//     // Capture the output from the Python script
//     pythonProcess.stdout.on("data", (data) => {
//       pythonOutput += data.toString();
//     });

//     // Handle any errors from the Python script
//     pythonProcess.stderr.on("data", (data) => {
//       logger.error(`Python script error: ${data}`);
//       res.status(500).json({
//         error: "An error occurred while running the Python script",
//         debug: data,
//       });
//     });

//     // Handle Python script timeout
//     pythonProcess.on("timeout", () => {
//       logger.error("Python script execution timed out");
//       pythonProcess.kill();
//       res.status(500).json({ error: "Python script execution timed out" });
//     });

//     // Send the response once the Python script finishes
//     pythonProcess.on("close", (code) => {
//       if (code === 0) {
//         try {
//           const result = JSON.parse(pythonOutput);
//           res.json(result);
//         } catch (error) {
//           logger.error(`Error parsing Python output: ${error}`);
//           res.status(500).json({
//             error: "An error occurred while parsing the Python script output",
//           });
//         }
//       } else {
//         logger.error(`Python script exited with code ${code}`);
//         res
//           .status(500)
//           .json({ error: "An error occurred while running the Python script" });
//       }
//     });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       res.status(400).json({ error: error.errors });
//     } else {
//       logger.error(`Error: ${error}`);
//       res.status(500).json({ error: "An internal server error occurred" });
//     }
//   }
// });

export { app };
