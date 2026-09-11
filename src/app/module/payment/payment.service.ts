import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import config from "../../config";

const initiatePayment = async (userId: string, assessmentId: string) => {
  const company = await prisma.companyProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!company) {
    throw new Error("Company profile not found");
  }

  const companyId = company.id;

  const assessment = await prisma.assessment.findUniqueOrThrow({
    where: {
      id: assessmentId,
    },
  });

  if (assessment.companyId !== companyId) {
    throw new Error("You can only pay for your own assessment");
  }

  if (!assessment.price || assessment.price <= 0) {
    throw new Error("This assessment is free");
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      companyId,
      assessmentId,
      status: "PAID",
    },
  });

  if (existingPayment) {
    throw new Error("This assessment has already been paid for");
  }

  const payment = await prisma.payment.create({
    data: {
      companyId,
      assessmentId,
      amount: assessment.price,
      currency: "usd",
      status: "PENDING",
    },
  });

  const stripe = new Stripe(config.stripe_secret_key);

  const session = await stripe.checkout.sessions.create({
    mode: "payment",

    line_items: [
      {
        price_data: {
          currency: "usd",

          product_data: {
            name: assessment.title,
          },

          unit_amount: Math.round(assessment.price * 100),
        },

        quantity: 1,
      },
    ],

    metadata: {
      paymentId: payment.id,
      companyId,
      assessmentId,
    },

    success_url: `${config.app_url}/payment?success=true&session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${config.app_url}/payment?cancel=true`,
  });

  await prisma.payment.update({
    where: {
      id: payment.id,
    },

    data: {
      transactionId: session.id,
    },
  });

  return {
    paymentId: payment.id,
    sessionId: session.id,
    checkoutUrl: session.url,
    amount: assessment.price,
    currency: "usd",
  };
};

const handleWebhook = async (sessionId: string) => {
  const stripe = new Stripe(config.stripe_secret_key);

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment is not completed");
  }

  const paymentId = session.metadata?.paymentId;
  const assessmentId = session.metadata?.assessmentId;
  const companyId = session.metadata?.companyId;

  if (!paymentId || !assessmentId || !companyId) {
    throw new Error("Payment metadata is missing");
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      assessmentId,
      companyId,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.status === "PAID") {
    throw new Error("Payment is already completed");
  }

  await prisma.payment.update({
    where: {
      id: payment.id,
    },
    data: {
      status: "PAID",
      transactionId: session.id,
    },
  });

  const assessment = await prisma.assessment.update({
    where: {
      id: assessmentId,
      companyId,
    },
    data: {
      status: "PUBLISHED",
    },
  });

  return {
    paymentId: payment.id,
    assessmentId: assessment.id,
    paymentStatus: "PAID",
    assessmentStatus: assessment.status,
  };
};

const getPaymentById = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findFirst({
    where: {
      id: paymentId,
      company: {
        userId: userId,
      },
    },
  });

  return payment;
};

const getAllPayments = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      company: {
        userId: userId,
      },
    },
    include: {
      assessment: true,
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments;
};

 

export const PaymentService = {
  initiatePayment,
  handleWebhook,
  getPaymentById,
  getAllPayments
};
