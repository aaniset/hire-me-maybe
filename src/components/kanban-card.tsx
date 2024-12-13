import React, { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLinkIcon, TrashIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
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
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface CardProps {
  title: string;
  position: string;
  company: string;
  date: string;
  id: string;
  nextStep?: string;
  keyDetails?: string[] | any;
  fromName?: string;
  from?: string;
  column: string;
  _id: string;
  setCards: any;
  handleDragStart: any;
  // setCards: React.Dispatch<React.SetStateAction<CardProps[]>>;
  // handleDragStart: (
  //   e: React.DragEvent<HTMLDivElement>,
  //   card: Pick<CardProps, "title" | "id" | "column">
  // ) => void;
}

interface IconProps {
  className?: string;
}

function BriefcaseIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function BuildingIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function CircleCheckIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function MailIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

const deleteApplication = async (applicationId: string): Promise<void> => {
  try {
    // Implement your delete logic here
    console.log(`Deleting application with ID: ${applicationId}`);
  } catch (error) {
    console.error("Error deleting application:", error);
    throw error;
  }
};

interface DropIndicatorProps {
  beforeId: string | null;
  column: string;
}
const DropIndicator: React.FC<DropIndicatorProps> = ({ beforeId, column }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-[hsl(var(--primary))] opacity-0"
    />
  );
};

const Card: React.FC<CardProps> = ({
  title,
  position,
  company,
  date,
  id,
  nextStep,
  keyDetails,
  fromName,
  from,
  column,
  _id,
  setCards,
  handleDragStart,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleDragEnd = async (applicationId: string): Promise<void> => {
    try {
      setIsLoading(true);
      await deleteApplication(applicationId);
      setCards((prevCards: any) =>
        prevCards.filter((c: any) => c._id !== applicationId)
      );
      toast("Job Application has been deleted.");
    } catch (error) {
      toast.error("Failed to delete application.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DropIndicator beforeId={id} column={column} />
      <motion.div
        layout
        layoutId={id}
        draggable="true"
        onDragStart={(e: any) => handleDragStart(e, { title, id, column })}
        // onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, { title, id, column })}
        className="cursor-grab rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 active:cursor-grabbing relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className="absolute top-1 right-1 flex space-x-1">
            <Badge
              className="w-fit"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(true);
              }}
            >
              <ExternalLinkIcon className="h-3 w-3 ml-1 inline" />
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive"
                >
                  <TrashIcon />
                </Badge>
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
                    onClick={() => handleDragEnd(_id)}
                    disabled={isLoading}
                  >
                    {isLoading ? "Processing..." : "Continue"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Job Application Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                <BriefcaseIcon className="w-6 h-6 text-primary" />
                <div>
                  <div className="font-medium">
                    {position || "Any Position"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BuildingIcon className="w-4 h-4" />
                    <span>{company}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="w-4 h-4" />
                    <span>
                      Applied on {format(new Date(date), "do MMMM yyyy")}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(date), { addSuffix: true })}
                    </Badge>
                  </div>
                </div>
              </div>

              {nextStep && (
                <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <CircleCheckIcon className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Next Step</div>
                    <div className="text-sm text-muted-foreground">
                      {nextStep}
                    </div>
                  </div>
                </div>
              )}

              {keyDetails && keyDetails.length > 0 && (
                <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <MailIcon className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">Key Details</div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {keyDetails.map((detail: any, index: any) => (
                        <li key={index}>
                          <CircleCheckIcon className="mr-2 inline-block h-4 w-4 text-green-500" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {fromName && from && (
                <div className="grid grid-cols-[auto_1fr] items-center gap-4">
                  <MailIcon className="w-6 h-6 text-primary" />
                  <div>
                    <div className="font-medium">From</div>
                    <div className="text-sm text-muted-foreground">
                      {fromName} ({from})
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Close
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">Delete</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your job application from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDragEnd(_id)}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Continue"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="w-full">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2 text-primary">
              {title || "Any Position"}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{company}</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {format(new Date(date), "do MMMM yyyy")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <Badge variant="secondary" className="text-xs">
                  {formatDistanceToNow(new Date(date), { addSuffix: true })}
                </Badge>
              </div>
            </div>
          </CardContent>
        </div>
      </motion.div>
    </>
  );
};

export default Card;
