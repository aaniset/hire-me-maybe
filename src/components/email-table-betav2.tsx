"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Loader from "@/components/loader";

interface Email {
  _id: string;
  from: string;
  fromName: string;
  subject: string;
  body: string;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          onClick={() => onPageChange(page)}
        >
          {page}
        </Button>
      ))}
    </div>
  );
};

export const EmailTableBetav2: React.FC = () => {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [emailsPerPage] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/api/getUserEmailData");
        console.log("response of email", response.data.data);
        setEmails(response.data.data);
      } catch (error) {
        console.error("Error fetching emails:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmails();
  }, []);

  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails =
    emails.length > 0
      ? emails.slice(indexOfFirstEmail, indexOfLastEmail)
      : emails;

  const handleSelectEmail = useCallback((emailId: string) => {
    setSelectedEmails((prev) =>
      prev.includes(emailId)
        ? prev.filter((id) => id !== emailId)
        : [...prev, emailId]
    );
  }, []);

  const handleDeleteSelected = useCallback(async () => {
    try {
      await axios.delete("/api/getUserEmailData", {
        data: { ids: selectedEmails },
      });
      // Remove deleted emails from the state
      setEmails((prevEmails) =>
        prevEmails.filter((email) => !selectedEmails.includes(email._id))
      );
      setSelectedEmails([]);
    } catch (error) {
      console.error("Error deleting selected emails:", error);
    }
  }, [selectedEmails]);

  const handleDeleteAll = useCallback(async () => {
    try {
      const allEmailIds = emails.map((email) => email._id);
      await axios.delete("/api/getUserEmailData", {
        data: { ids: allEmailIds },
      });
      // Clear all emails from the state
      setEmails([]);
      setSelectedEmails([]);
    } catch (error) {
      console.error("Error deleting all emails:", error);
    }
    // Implement actual delete all logic here
  }, [emails]);

  const handlePageChange = useCallback((pageNumber: number) => {
    setCurrentPage(pageNumber);
  }, []);

  const isAllSelected = useMemo(
    () =>
      currentEmails.length > 0 &&
      currentEmails.every((email) => selectedEmails.includes(email._id)),
    [currentEmails, selectedEmails]
  );

  const toggleAllSelected = useCallback(() => {
    if (isAllSelected) {
      setSelectedEmails((prev) =>
        prev.filter((id) => !currentEmails.some((email) => email._id === id))
      );
    } else {
      setSelectedEmails((prev) => [
        ...prev,
        ...currentEmails
          .map((email) => email._id)
          .filter((id) => !prev.includes(id)),
      ]);
    }
  }, [currentEmails, isAllSelected]);

  return (
    <div className="container mx-auto px-4 py-8">
      {isLoading ? (
        <Loader className="w-full h-full " />
      ) : (
        <div className=" rounded-lg shadow-md overflow-hidden">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={handleDeleteSelected}
                  disabled={selectedEmails.length === 0}
                >
                  Delete Selected
                </Button>
                <Button onClick={handleDeleteAll}>Delete All</Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={toggleAllSelected}
                    />
                  </TableHead>
                  <TableHead className="w-1/5">From</TableHead>
                  <TableHead className="w-1/5">From Name</TableHead>
                  <TableHead className="w-1/5">Subject</TableHead>
                  <TableHead>Body</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentEmails.map((email) => (
                  <TableRow key={email._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedEmails.includes(email._id)}
                        onCheckedChange={() => handleSelectEmail(email._id)}
                      />
                    </TableCell>
                    <TableCell className="truncate">{email.from}</TableCell>
                    <TableCell className="truncate">{email.fromName}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="truncate text-left block w-full">
                            {email.subject}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-md">{email.subject}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="truncate text-left block w-full">
                            {email.body}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-md">{email.body}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="p-4 sm:p-6 border-t">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(emails.length / emailsPerPage)}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </div>
  );
};
