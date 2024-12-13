"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { JobApplicationForm } from "@/components/jobApplicationForm";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon } from "lucide-react";
import ConnectGmailButton from "@/components/connectGmailButton";
import Loader from "@/components/loader";
import Card from "./kanban-card";
export const CustomKanban = () => {
  return (
    <div className="h-screen/2 w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <Board />
    </div>
  );
};
interface KeyDetail {
  [index: number]: string;
}

interface Application {
  _id: string;
  jobId: string;
  position: string;
  company: string;
  status: string;
  nextStep: string;
  applicationDate: string;
  keyDetails: KeyDetail;
  userId: string;
  from: string;
  fromName: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  id: string;
}
interface Card extends Application {
  title: string;
  column: string;
}
interface ColumnProps {
  title: string;
  headingColor: string;
  cards: Card[];
  column: string;
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
}
const Board = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/fetch-applications");
      if (!response.data) {
        throw new Error("Failed to fetch applications");
      }
      const cardsWithNewFields: Card[] = response.data.data.map((app: any) => ({
        ...app,
        title: app.position,
        column: app.status,
      }));

      setCards(cardsWithNewFields);
      setFilteredCards(cardsWithNewFields);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    const filtered = cards.filter(
      (card) =>
        card?.position?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card?.company?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCards(filtered);
  }, [searchQuery, cards]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const handleUpdateRequired = () => {
    fetchApplications();
  };
  if (loading) {
    return <Loader size="lg" />;
  }

  return (
    <>
      <div className="w-full bg-background">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 md:space-x-4">
            <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64 md:w-80">
                <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search applications"
                  className="pl-9 w-full"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              <JobApplicationForm setCards={setCards} />
            </div>
            <ConnectGmailButton onUpdateRequired={handleUpdateRequired} />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <Column
            title="Applied"
            column="applied"
            headingColor="text-neutral-500"
            cards={filteredCards}
            setCards={setCards}
          />
          <Column
            title="Interviewing"
            column="interviewing"
            headingColor="text-yellow-200"
            cards={filteredCards}
            setCards={setCards}
          />
          <Column
            title="Accepted"
            column="accepted"
            headingColor="text-blue-200"
            cards={filteredCards}
            setCards={setCards}
          />
          <Column
            title="Rejected"
            column="rejected"
            headingColor="text-emerald-200"
            cards={filteredCards}
            setCards={setCards}
          />
        </div>
      </div>
    </>
  );
};
const Column: React.FC<ColumnProps> = ({
  title,
  headingColor,
  cards,
  column,
  setCards,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [showAll, setShowAll] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Card[]>([]);

  const filteredCards = cards.filter((c) => c.column === column);
  const hasMoreCards = filteredCards.length > 5;

  useEffect(() => {
    setVisibleCards(showAll ? filteredCards : filteredCards.slice(0, 5));
  }, [showAll, cards, column]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, card: Card) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const cardId = e.dataTransfer.getData("cardId");

    setActive(false);
    clearHighlights();

    const indicators = getIndicators();
    const { element } = getNearestIndicator(e, indicators);

    const before = element?.dataset.before || "-1";

    if (before !== cardId) {
      let copy = [...cards];

      let cardToTransfer = copy.find((c) => c.id === cardId);
      if (!cardToTransfer) return;
      cardToTransfer = { ...cardToTransfer, column };

      copy = copy.filter((c) => c.id !== cardId);

      const moveToBack = before === "-1";

      if (moveToBack) {
        copy.push(cardToTransfer);
      } else {
        const insertAtIndex = copy.findIndex((el) => el.id === before);
        if (insertAtIndex === undefined) return;

        copy.splice(insertAtIndex, 0, cardToTransfer);
      }

      setCards(copy);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    highlightIndicator(e);
    setActive(true);
  };

  const handleDragLeave = () => {
    clearHighlights();
    setActive(false);
  };

  const clearHighlights = (els?: HTMLElement[]) => {
    const indicators = els || getIndicators();
    indicators.forEach((i) => {
      i.style.opacity = "0";
    });
  };

  const highlightIndicator = (e: React.DragEvent<HTMLDivElement>) => {
    const indicators = getIndicators();
    clearHighlights(indicators);
    const el = getNearestIndicator(e, indicators);
    if (el.element) {
      el.element.style.opacity = "1";
    }
  };

  const getNearestIndicator = (
    e: React.DragEvent<HTMLDivElement>,
    indicators: HTMLElement[]
  ) => {
    const DISTANCE_OFFSET = 50;

    const el = indicators.reduce(
      (closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = e.clientY - (box.top + DISTANCE_OFFSET);

        if (offset < 0 && offset > closest.offset) {
          return { offset: offset, element: child };
        } else {
          return closest;
        }
      },
      {
        offset: Number.NEGATIVE_INFINITY,
        element: indicators[indicators.length - 1],
      }
    );

    return el;
  };

  const getIndicators = (): HTMLElement[] => {
    return Array.from(document.querySelectorAll(`[data-column="${column}"]`));
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-row items-center justify-center gap-2">
          <span className={`rounded text-sm  ${headingColor}`}>
            {filteredCards.length}
          </span>
          <h3 className={`font-medium ${headingColor}`}>{title}</h3>
        </div>
        <JobApplicationForm initialStatus={column} setCards={setCards} />
      </div>
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`h-full w-full transition-colors ${
          active ? "bg-neutral-800/50" : "bg-neutral-800/0"
        }`}
      >
        {visibleCards.map((c) => (
          <Card
            key={c.id}
            {...c}
            setCards={setCards}
            handleDragStart={handleDragStart}
          />
        ))}
        {hasMoreCards && (
          <motion.div
            layout
            draggable="true"
            onClick={toggleShowAll}
            className="cursor-grab my-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 active:cursor-grabbing relative"
          >
            <p className="text-sm text-center text-[hsl(var(--card-foreground))]">
              {showAll ? "Hide" : "Show More"}
            </p>
          </motion.div>
        )}
        <DropIndicator beforeId={null} column={column} />
      </div>
    </div>
  );
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
