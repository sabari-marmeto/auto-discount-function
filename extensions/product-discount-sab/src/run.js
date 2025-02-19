// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 * @typedef {import("../generated/api").Target} Target
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log("Received input:", JSON.stringify(input, null, 2));

  if (!input || !input.cart || !input.cart.lines) {
    console.error("Error: Cart data is missing from input.");
    return EMPTY_DISCOUNT;
  }

  const cartLines = input.cart.lines;

  if (cartLines.length === 0) {
    console.error("Cart is empty. No discount applied.");
    return EMPTY_DISCOUNT;
  }

  let totalCartValue = 0;
  cartLines.forEach((line) => {
    if (!line.cost || !line.cost.totalAmount || !line.cost.totalAmount.amount) {
      console.error(`Missing price data for line: ${JSON.stringify(line)}`);
    } else {
      totalCartValue += parseFloat(line.cost.totalAmount.amount);
    }
  });

  console.log(`Total cart value calculated: ${totalCartValue}`);

  let discountPercentage = 0;

  if (totalCartValue >= 5000) {
    discountPercentage = 50;
  } else if (totalCartValue >= 2000) {
    discountPercentage = 25;
  } else if (totalCartValue >= 1000) {
    discountPercentage = 15;
  } else {
    console.log("Cart value does not meet the minimum discount threshold.");
    return EMPTY_DISCOUNT;
  }

  const targets = cartLines.map((line) => ({
    cartLine: { id: line.id },
  }));

  console.log(`Applying ${discountPercentage}% discount to ${targets.length} cart lines.`);

  return {
    discounts: [
      {
        targets,
        value: {
          percentage: {
            value: discountPercentage.toString(),
          },
        },
        message: `You received a ${discountPercentage}% discount!`,
      },
    ],
    discountApplicationStrategy: DiscountApplicationStrategy.First,
  };
}
