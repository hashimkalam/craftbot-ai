"use client";

import { REMOVE_CHARACTERISTIC } from "@/graphql/mutation";
import { ChatbotCharacteristic } from "@/types/types";
import { useMutation } from "@apollo/client";
import { OctagonX } from "lucide-react";
import { toast } from "sonner";

const Characteristic = ({ 
  characteristic,
}: { 
  characteristic: ChatbotCharacteristic;
}) => {
  const [removeCharacteristic] = useMutation(REMOVE_CHARACTERISTIC, {
    refetchQueries: ["GetChatbotById"], // refetch and update the ui
  });

  const handleRemoveCharacteristic = async (characteristicId: number) => {
    try {
      await removeCharacteristic({
        variables: {
          characteristicId,
        },
      });
    } catch (error) {
      console.error(error);
      throw error; // ensure the error is thrown so toast.promize can catch it 
    }
  };

  return (
    <li key={characteristic.id} className="relative p-10 bg-white border rounded-md">
      {characteristic.content}
      <OctagonX
        className="w-6 h-6 text-white fill-red-500 absolute top-1 right-1 pointer hover:opacity-50"
        onClick={() => {
          const promise = handleRemoveCharacteristic(characteristic.id);
          toast.promise(promise, {
            loading: "removing",
            success: "characteristic removed",
            error: "failed to remove the characteristic",
          });
        }}
      />
    </li>
  );
};

export default Characteristic;
