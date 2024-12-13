"use client";

import * as React from "react";
import { CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import Loader from "@/components/loader";
type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface TeamSwitcherProps extends PopoverTriggerProps {}

export default function TeamSwitcher({ session }: any) {
  const user = session?.user;
  const [open, setOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isProfile, setIsProfile] = React.useState(false);
  React.useEffect(() => {
    if (session.user) {
      setIsProfile(true);
    }
  }, [user]);

  if (!isProfile) {
    return <Loader size="sm" />;
  }

  const handleSignOut = () => {
    // Implement sign out logic here
    signOut({
      callbackUrl: `${window.location.origin}/login`,
    });
    console.log("Signing out...");
    setOpen(false);
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
      setOpen(false);
    } catch (error) {
      console.error("Error deleting user profile:", error);
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="User menu"
          className={cn("w-[200px] justify-between")}
        >
          <Avatar className="mr-2 h-5 w-5">
            <AvatarImage
              src={user?.image ? user.image : ""}
              alt="User avatar"
              className="grayscale"
            />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          {user?.name || "User"}
          <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start text-left text-destructive"
              >
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete Profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteProfile}
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Continue"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PopoverContent>
    </Popover>
  );
}
