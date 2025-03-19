"use client";

import { Button } from "@/components/ui/button";
import { useReverification } from "@clerk/nextjs";
import { isClerkRuntimeError } from "@clerk/nextjs/errors";
import { toast } from "sonner";
import { getBalance } from "../actions/getBalance";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { RatelimitError } from "@/lib/error";

export default function UserBalance() {
  const [balance, setBalance] = useState<{
    amount: number;
    currency: string;
  } | null>(null);
  const retrieveBalance = useReverification(getBalance);

  const formatBalace = useMemo(() => {
    if (!balance) {
      return "hidden";
    }

    return Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currency,
    }).format(balance.amount);
  }, [balance])

  const handleBalanceRetrieve = async () => {
    try {
      if (balance) {
        setBalance(null);
        return;
      }

      const balanceResponse = await retrieveBalance();

      setBalance(balanceResponse);

      toast.success("Balance retrieved successfully");
    } catch (e) {
      // Handle if user cancels the reverification process
      if (isClerkRuntimeError(e) && e.code === "reverification_cancelled") {
        toast.error("User cancelled reverification");
        return;
      }

      if (e instanceof RatelimitError) {
        toast.error("You are making too many requests. Please try again later.");
      } else {
        toast.error("An error occurred while retrieving your balance");
      }
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <div>
          Your balance is{" "}
          <span className={
            cn(
              "font-bold",
            )
          }>
            {formatBalace}
          </span>
        </div>
        <div className="space-x-4">
          <Button onClick={handleBalanceRetrieve}>
            {balance ? "Hide" : "Retrieve"} balance
          </Button>
        </div>
      </div>
    </div>
  );
}
