import Avatar from "@/components/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CreateChatBot = () => {
  return (
    <div className="flex flex-col items-center justify-center lg:flex-row md:space-x-10 bg-white p-10 rounded-md m-10">
      <Avatar seed="create-chatbot" />

      <div>
        <h1 className="text-xl lg:text-3xl font-semibold">Create</h1>
        <h2 className="font-light">
          Create a new chatbot to assist you in your conversations with your
          customers
        </h2>

        <form className="flex flex-col md:flex-row mt-6">
          <Input type="text" placeholder="Chatbot Name..." className="max-w-lg mb-2 md:mb-0" required />
          <Button>Create Chatbot</Button>
        </form>
      </div>
    </div>
  );
};

export default CreateChatBot;
