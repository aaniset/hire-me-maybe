"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import { signOut } from "next-auth/react";

export default function Settings({ session }: any) {
  let user = session?.user;
  const [firstName, setFirstName] = useState(user?.name?.split(" ")[0] || "");
  const [lastName, setLastName] = useState(
    user?.name?.split(" ").slice(1).join(" ") || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalName, setOriginalName] = useState(user?.name || "");

  useEffect(() => {
    const currentName = `${firstName} ${lastName}`.trim();
    setHasChanges(originalName !== currentName);
  }, [firstName, lastName, user?.name, originalName]);

  const saveChanges = async () => {
    setIsLoading(true);
    try {
      const response = await axios.patch("/api/profile", {
        name: `${firstName} ${lastName}`.trim(),
      });
      setOriginalName(`${firstName} ${lastName}`.trim());
      if (response.data.success) {
        toast("Your name has been successfully updated.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteProfile = async () => {
    // Implement delete profile logic here
    try {
      setIsLoading(true);
      console.log("Deleting profile...");
      const response = await axios.delete("/api/profile");

      if (response.data.success) {
        console.log("User profile deleted successfully");
        // Handle successful deletion (e.g., redirect to home page, clear local storage, etc.)
      } else {
        console.error("Failed to delete user profile");
      }
      signOut({
        callbackUrl: `${window.location.origin}/login`,
      });
    } catch (error) {
      console.error("Error deleting user profile:", error);
      // Handle error (e.g., show error message to user)
    }
    console.log("Delete profile clicked");
  };

  return (
    <div className="flex justify-center items-center flex-wrap px-4 pt-5 gap-4">
      <Card className="flex flex-col gap-3 mb-[5rem] w-full max-w-[700px]">
        <CardHeader>
          <h2 className="text-3xl font-semibold  text-center">My Profile</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" defaultValue={user?.email || ""} disabled />
            </div>
            <div>
              <Label htmlFor="gmailAccount">Connected Gmail Account</Label>
              <Input
                id="gmailAccount"
                defaultValue={user?.gmailAccount || ""}
                disabled
              />
            </div>
            <div className="flex justify-between items-center mt-8">
              <Button variant="destructive" onClick={handleDeleteProfile}>
                Delete Profile
              </Button>
              <Button
                onClick={saveChanges}
                disabled={!isLoading && !hasChanges}
                variant={"default"}
              >
                {isLoading ? "Saving ..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
