-- CreateEnum
CREATE TYPE "public"."BillingProvider" AS ENUM ('STRIPE', 'PADDLE', 'LEMONSQUEEZY');

-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED', 'INCOMPLETE', 'UNPAID');

-- CreateTable
CREATE TABLE "public"."billing_customers" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "public"."BillingProvider" NOT NULL,
    "providerCustomerId" TEXT NOT NULL,
    "defaultPaymentMethodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_payment_methods" (
    "id" TEXT NOT NULL,
    "billingCustomerId" TEXT NOT NULL,
    "providerPaymentMethodId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "last4" TEXT NOT NULL,
    "expMonth" INTEGER NOT NULL,
    "expYear" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_subscriptions" (
    "id" TEXT NOT NULL,
    "billingCustomerId" TEXT NOT NULL,
    "providerSubscriptionId" TEXT NOT NULL,
    "status" "public"."SubscriptionStatus" NOT NULL,
    "planName" TEXT,
    "priceId" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN DEFAULT false,
    "endedAt" TIMESTAMP(3),
    "trialStart" TIMESTAMP(3),
    "trialEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_invoices" (
    "id" TEXT NOT NULL,
    "billingCustomerId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "providerInvoiceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "hostedInvoiceUrl" TEXT,
    "pdf" TEXT,
    "issuedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_customers_defaultPaymentMethodId_key" ON "public"."billing_customers"("defaultPaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_customers_userId_provider_key" ON "public"."billing_customers"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "billing_customers_provider_providerCustomerId_key" ON "public"."billing_customers"("provider", "providerCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_payment_methods_billingCustomerId_providerPaymentMe_key" ON "public"."billing_payment_methods"("billingCustomerId", "providerPaymentMethodId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_subscriptions_providerSubscriptionId_key" ON "public"."billing_subscriptions"("providerSubscriptionId");

-- CreateIndex
CREATE INDEX "billing_invoices_subscriptionId_idx" ON "public"."billing_invoices"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoices_providerInvoiceId_key" ON "public"."billing_invoices"("providerInvoiceId");

-- AddForeignKey
ALTER TABLE "public"."billing_customers" ADD CONSTRAINT "billing_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_customers" ADD CONSTRAINT "billing_customers_defaultPaymentMethodId_fkey" FOREIGN KEY ("defaultPaymentMethodId") REFERENCES "public"."billing_payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_payment_methods" ADD CONSTRAINT "billing_payment_methods_billingCustomerId_fkey" FOREIGN KEY ("billingCustomerId") REFERENCES "public"."billing_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_billingCustomerId_fkey" FOREIGN KEY ("billingCustomerId") REFERENCES "public"."billing_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_invoices" ADD CONSTRAINT "billing_invoices_billingCustomerId_fkey" FOREIGN KEY ("billingCustomerId") REFERENCES "public"."billing_customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_invoices" ADD CONSTRAINT "billing_invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."billing_subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
