"use client";

import { Button } from "@/components/ui/button";
import { useReverification, useUser } from "@clerk/nextjs";
import { isClerkRuntimeError } from "@clerk/nextjs/errors";
import { toast } from "sonner";

export default function UpdateUser() {
  const { user } = useUser();
  const makeEmailPrimary = useReverification((emailAddressId: string) =>
    user?.update({ primaryEmailAddressId: emailAddressId })
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

      toast.error("An error occurred while updating your primary email");
    }
  };

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
