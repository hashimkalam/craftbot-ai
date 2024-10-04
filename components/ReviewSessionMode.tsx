"use client";

function ReviewSessionMode({
  mode,
  setMode,
}: {
  mode: number;
  setMode: (mode: number) => void;
}) {
  console.log("mode: ", mode);
  return (
    <div className="flex justify-evenly text-center text-white mt-8">
      <button
        onClick={() => setMode(0)}
        className={`cursor-pointer w-full py-2 ${
          mode === 0 ? "bg-primary font-bold" : "bg-primary/80"
        }`}
      >
        Get To Know More
      </button>
      <p
        onClick={() => setMode(1)}
        className={`cursor-pointer w-full py-2 ${
          mode === 1 ? "bg-primary font-bold" : "bg-primary/80"
        }`}
      >
        Feedback
      </p>
    </div>
  );
}

export default ReviewSessionMode;
