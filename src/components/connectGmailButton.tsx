// "use client";
// import { useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   RefreshCw as RefreshCwIcon,
//   Trash as TrashIcon,
//   Mail as MailIcon,
//   MoreVertical as MoreVerticalIcon,
// } from "lucide-react";
// import { signIn, useSession } from "next-auth/react";
// import axios from "axios";

// export default function ConnectGmailButton() {
//   const [isConnected, setIsConnected] = useState(false);
//   const [lastSynced, setLastSynced] = useState("just now");
//   const { data: session } = useSession();
//   setIsConnected(
//     session?.user?.gmailConnected ? session.user?.gmailConnected : false
//   );
//   const fetchEmails = async () => {
//     try {
//       const response = await axios.post("/api/fetch-emails");

//       console.log("Emails fetched successfully:", response.data);
//       // Handle the response data here (e.g., update state, display messages)
//     } catch (error) {
//       console.error("Error fetching emails:", error);
//       // Handle any errors here (e.g., display error message to user)
//     }
//   };

//   const handleConnect = async () => {
//     // Simulating Gmail connection
//     signIn(
//       "google",
//       {
//         callbackUrl: "/dashboard",
//         // state: state,
//       },
//       {
//         scope:
//           "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
//       }
//     );
//     setIsConnected(true);
//     setLastSynced("just now");
//   };

//   const handleResync = () => {
//     fetchEmails();
//     // Simulating resync
//     setLastSynced("just now");
//   };

//   const handleRemove = () => {
//     // Simulating disconnection
//     setIsConnected(false);
//   };

//   return (
//     <div className="flex items-center space-x-4">
//       {!isConnected ? (
//         <Button
//           variant="outline"
//           onClick={handleConnect}
//           className="whitespace-nowrap"
//         >
//           <MailIcon className="mr-2 h-4 w-4" />
//           Connect Gmail
//         </Button>
//       ) : (
//         <div className="flex items-center space-x-2 border border-input bg-background p-2 rounded-lg">
//           <Avatar className="h-8 w-8">
//             <AvatarImage src={session?.user.gmailProfileImg} alt="User" />
//             <AvatarFallback>U</AvatarFallback>
//           </Avatar>
//           <div className="hidden sm:block">
//             <p className="text-sm font-medium leading-none">
//               {session?.user.gmailAccount}
//             </p>
//             <p className="text-xs text-muted-foreground">
//               Last synced: {lastSynced}
//             </p>
//           </div>
//           <Badge
//             variant="secondary"
//             className="bg-green-500 text-white hover:bg-green-500 "
//           >
//             Connected
//           </Badge>
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                 <MoreVerticalIcon className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               <DropdownMenuItem onClick={handleResync}>
//                 <RefreshCwIcon className="mr-2 h-4 w-4" />
//                 Resync
//               </DropdownMenuItem>
//               <DropdownMenuItem onClick={handleRemove}>
//                 <TrashIcon className="mr-2 h-4 w-4" />
//                 Remove
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  RefreshCw as RefreshCwIcon,
  Trash as TrashIcon,
  MoreVertical as MoreVerticalIcon,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import axios from "axios";
import { useLastSynced } from "@/hooks/last-synced";
import Loader from "./loader";
import { toast } from "sonner";
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
function MailIcon(props: any) {
  return (
    // <svg
    // {...props}
    // xmlns="http://www.w3.org/2000/svg"
    //   width="24"
    //   height="24"
    //   viewBox="0 0 24 24"
    // fill="none"
    // stroke="currentColor"
    //   strokeWidth="2"
    //   strokeLinecap="round"
    //   strokeLinejoin="round"
    // >
    //   <rect width="20" height="16" x="2" y="4" rx="2" />
    //   <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    // </svg>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      x="0px"
      y="0px"
      width="50"
      height="50"
      viewBox="0 0 48 48"
    >
      <path
        fill="#4caf50"
        d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"
      ></path>
      <path
        fill="#1e88e5"
        d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"
      ></path>
      <polygon
        fill="#e53935"
        points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"
      ></polygon>
      <path
        fill="#c62828"
        d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"
      ></path>
      <path
        fill="#fbc02d"
        d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"
      ></path>
    </svg>
  );
}

export default function ConnectGmailButton({ onUpdateRequired }: any) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { lastSynced, updateLastSynced, getLastSyncedText } = useLastSynced();

  // const [lastSynced, setLastSynced] = useState("just now");
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.gmailConnected !== undefined) {
      setIsConnected(session.user.gmailConnected);
    }
  }, [session]);

  const fetchEmails = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/fetch-emails");
      console.log("Emails fetched successfully:", response.data);
      updateLastSynced();
      if (response.data.update) {
        onUpdateRequired();
      }
      // toast("Gmail resync successful");
      toast(
        <div className="flex gap-2 justify-center  items-center">
          <MailIcon className="h-8 w-8" />
          Gmail resync successful
        </div>
      );

      // Handle the response data here (e.g., update state, display messages)
    } catch (error) {
      console.error("Error fetching emails:", error);
      // Handle any errors here (e.g., display error message to user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    signIn(
      "google",
      {
        callbackUrl: "/dashboard",
      },
      {
        scope:
          "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      }
    );
    // Note: setIsConnected(true) is removed from here as it will be handled by the useEffect hook when the session updates
    updateLastSynced();
  };

  const handleResync = () => {
    fetchEmails();
  };

  const handleRemove = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/remove-gmail");
      console.log("Emails fetched successfully:", response.data);
      setIsConnected(false);
      toast(
        <div className="flex gap-2 justify-center  items-center">
          <MailIcon className="h-8 w-8" />
          Gmail disconnected successfully
        </div>
      );
    } catch (error) {
      console.error("Error fetching emails:", error);
      // Handle any errors here (e.g., display error message to user)
    } finally {
      setIsLoading(false);
    }
    // You might want to add logic here to actually disconnect the account
  };

  return (
    <div className="flex items-center space-x-4 w-full md:w-auto">
      {!isConnected ? (
        <Button
          variant="outline"
          onClick={handleConnect}
          className="whitespace-nowrap animate-buttonheartbeat rounded-md"
        >
          <MailIcon className="mr-2 h-4 w-4" />
          Connect Gmail
        </Button>
      ) : (
        <div className="flex items-center space-x-2 border border-input bg-background p-2 rounded-lg">
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <>
              <Avatar className="h-8 w-8">
                <AvatarImage src={session?.user.gmailProfileImg} alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {session?.user.gmailAccount}
                </p>
                <p className="text-xs text-muted-foreground">
                  Last synced: {getLastSyncedText()}
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-500 text-white hover:bg-green-500 "
              >
                {" "}
                <MailIcon className="mr-2 h-4 w-4 " />
                Connected
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVerticalIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleResync}>
                    <RefreshCwIcon className="mr-2 h-4 w-4" />
                    Resync
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleRemove}>
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      )}
    </div>
  );
}
