'use client';

import { useSession } from "@clerk/nextjs";
import {
  SessionVerificationResource,
  SessionVerificationLevel,
  EmailCodeFactor,
} from "@clerk/types";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Label } from "../ui/label";

export function VerificationComponent({
  level = 'first_factor',
  complete,
  cancel,
}: {
  level?: SessionVerificationLevel;
  complete: () => void;
  cancel: () => void;
}) {
  const { session } = useSession();
  const [code, setCode] = useState<string>("");
  const [verificationResource, setVerificationResource] = useState<EmailCodeFactor | null>(null);

  const prepareEmailVerification = async (verificationResource: SessionVerificationResource) => {
    // To simplify the example we will only handle the first factor verification
    if (verificationResource.status === "needs_first_factor") {
      const determinedStartingFirstFactor =
        verificationResource.supportedFirstFactors?.filter((factor) => factor.strategy === "email_code")[0];

      setVerificationResource(determinedStartingFirstFactor || null);

      if (determinedStartingFirstFactor) {
        await session?.prepareFirstFactorVerification({
          strategy: determinedStartingFirstFactor.strategy,
          emailAddressId: determinedStartingFirstFactor?.emailAddressId,
        });
      }
    }

    // we can also handle other verification statuses here
  }

  useEffect(() => {
    session
      ?.startVerification({
        level: level || "first_factor",
      })
      .then(async (response) => prepareEmailVerification(response));
  }, []);

  const handleVerificationAttempt = async () => {
    try {
      const verification = await session?.attemptFirstFactorVerification({
        strategy: "email_code",
        code,
      });

      if (verification?.status === "complete") {
        complete();
      }
    } catch (e) {
      console.error("Error verifying session", e);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1>
        You have reveived an email code at <span className="font-bold">{verificationResource?.safeIdentifier}</span>
      </h1>
      <div className="flex shrink-0 flex-col gap-2 items-center">
        <Label>Enter verification code</Label>
        <InputOTP
          maxLength={6}
          value={code}
          onChange={(value) => setCode(value)}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex gap-4 justify-end">
        <Button onClick={cancel} variant="ghost">Cancel</Button>
        <Button
          onClick={async () => handleVerificationAttempt()}
        >
          Complete
        </Button>
      </div>
    </div>
  );
}
