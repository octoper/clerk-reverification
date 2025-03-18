"use client";

import { VerificationComponent } from "@/components/reverification/reverification";
import { Button } from "@/components/ui/button";
import { RatelimitError } from "@/lib/error";
import { useReverification, useUser } from "@clerk/nextjs";
import { isClerkRuntimeError } from "@clerk/nextjs/errors";
import { toast } from "sonner";

export default function UpdateUser() {
  const { user } = useUser();
  const {
    action: makeEmailPrimary,
    inProgress,
    cancel,
    complete,
    level,
  } = useReverification(
    (emailAddressId: string) =>
      user?.update({ primaryEmailAddressId: emailAddressId }),
    {
      defaultUI: false,
    }
  );

  const handleClick = async (emailAddressId: string) => {
    try {
      await makeEmailPrimary(emailAddressId);

      toast.success("Primary email updated successfully");
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

  if (inProgress) {
    return (
      <div className="flex items-center justify-center">
        <VerificationComponent
          level={level}
          complete={complete}
          cancel={cancel}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <span>
          Your primary email address is{" "}
          <span className="font-bold">
            {user?.primaryEmailAddress?.emailAddress}
          </span>
        </span>

        <div className="flex flex-col gap-4">
          {user?.emailAddresses.map((email) => (
            <div key={email.id} className="flex flex-grow items-center gap-2">
              <div className="flex flex-grow">
                {email.emailAddress} - {email.verification.status}
              </div>
              <div>
                {user?.primaryEmailAddress?.id !== email.id ? (
                  <Button size="sm" onClick={() => handleClick(email.id)}>
                    Make primary
                  </Button>
                ) : (
                  <span>Primary</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
