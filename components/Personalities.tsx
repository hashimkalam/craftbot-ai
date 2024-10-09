import { PERSONALITIES } from '@/data/data';
import { CheckSquare, Square } from 'lucide-react';
import React from 'react'

function Personalities({ selectedPersonality, setSelectedPersonality }: { selectedPersonality: any, setSelectedPersonality:any }) {
  return (
    <div className="flex flex-wrap justify-start mt-2">
    {PERSONALITIES.map(({ id, label }) => (
      <button
        key={id}
        onClick={(e) => {
          e.preventDefault(); // Prevent form submission on button click
          setSelectedPersonality(id); // Set the selected personality
        }}
        className="flex items-center p-2 rounded border m-1 bg-gray-100 dark:bg-primary-DARK border-transparent"
      >
        {selectedPersonality === id ? (
          <CheckSquare className="mr-2 text-blue-500" />
        ) : (
          <Square className="mr-2 text-gray-500" />
        )}
        {label}
      </button>
    ))}
  </div>
  )
}

export default Personalities