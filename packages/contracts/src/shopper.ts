import { z } from "zod"
import { Id, IsoDateTime } from "./common"

/** The signed-in Shopper as every client sees her. */
export const ShopperView = z.object({
  id: Id,
  email: z.email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  createdAt: IsoDateTime,
})
export type ShopperView = z.infer<typeof ShopperView>

/** Minimum password length accepted at sign-up. */
export const PASSWORD_MIN_LENGTH = 8

export const SignUpInput = z.object({
  email: z.email(),
  password: z.string().min(PASSWORD_MIN_LENGTH),
  firstName: z.string().trim().min(1).optional(),
  lastName: z.string().trim().min(1).optional(),
})
export type SignUpInput = z.infer<typeof SignUpInput>

export const SignInInput = z.object({
  email: z.email(),
  password: z.string().min(1),
})
export type SignInInput = z.infer<typeof SignInInput>
