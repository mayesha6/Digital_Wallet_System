import { z } from "zod";

export const updateWalletZodSchema = z.object({
  isBlocked: z.boolean({
    message: "isBlocked must be true or false",
  }),
});
