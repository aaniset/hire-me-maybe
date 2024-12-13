import { useState, useCallback } from 'react';
import { KanbanColumn, KanbanCard } from '@/types/global-types';

const initialColumns: KanbanColumn[] = [
  { id: 'applied', title: 'Applied' },
  { id: 'interviewing', title: 'Interviewing' },
  { id: 'accepted', title: 'Accepted' },
  { id: 'rejected', title: 'Rejected' },
];

const initialCards: KanbanCard[] = [
  // Add some initial cards here
];

export const useKanbanData = () => {
  const [columns] = useState<KanbanColumn[]>(initialColumns);
  const [cards, setCards] = useState<KanbanCard[]>(initialCards);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moveCard = useCallback((cardId: string, sourceColumnId: string, destinationColumnId: string) => {
    setCards(prevCards => {
      const cardIndex = prevCards.findIndex(card => card.id === cardId);
      const updatedCard = { ...prevCards[cardIndex], status: destinationColumnId };
      const updatedCards = [...prevCards];
      updatedCards[cardIndex] = updatedCard;
      return updatedCards;
    });
  }, []);

  const addCard = useCallback((newCard: Omit<KanbanCard, 'id'>) => {
    setCards(prevCards => [...prevCards, { ...newCard, id: Date.now().toString() }]);
  }, []);

  return { columns, cards, loading, error, moveCard, addCard };
};