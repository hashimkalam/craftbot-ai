import { ModeToggle } from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { FEATURES } from "@/data/data";
import { auth } from "@clerk/nextjs/server";
// import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// import image1 from "@/public/images/image1.webp";
// \\import image2 from "@/public/images/image2.webp";
import FlickeringGrid from "@/components/ui/flickering-grid";
import HeroVideoDialog from "@/components/ui/hero-video-dialog";

export default async function Home() {
  const { userId } = await auth(); 

  if (userId) redirect("/dashboard");

  return (
    <main className="bg-gradient-to-bl from-white dark:from-gray-900 to-primary dark:to-indigo-900 flex-1 overflow-scroll p-2 lg:p-5 relative">
      <div className="absolute top-8 right-8 z-50">
        <ModeToggle />
      </div>

      <div className="bg-white/95 dark:bg-black/50 py-24 sm:p-32 rounded-md drop-shadow-xl relative h-full">
        <FlickeringGrid
          className="z-0 absolute inset-0 w-full h-full opacity-20"
          squareSize={4}
          gridGap={6}
          color="#60A5FA"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
        <div className="flex flex-col justify-center items-center mx-auto max-w-7xl px-6 lg:px-8 z-40 pb-10">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary capitalize">
              Your AI chatbot solution
            </h2>

            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-6xl capitalize">
              Create custom chatbots effortlessly
            </p>

            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Welcome to{" "}
              <span className="font-bold text-primary">
                Custom Chatbot Generator.
              </span>
              <br />
              <br />
              Design and deploy your own AI chatbots in minutes! Our tool allows
              you to customize your bot&lsquos personality and functionality,
              making it suitable for any application, from customer support to
              personal assistants. Transform your ideas into interactive
              conversations with{" "}
              <span className="font-bold">Custom Chatbot Generator</span>,
              boosting your engagement and productivity effortlessly.
            </p>
          </div>

          <Button asChild className="mt-10">
            <Link href="/dashboard" className="dark:text-white">
              {userId ? "Go to Your Chatbots" : "Get Started"}
            </Link>
          </Button>
        </div>
        {/* Screenshot Image Section */}
        {/*<div className="relative overflow-hidden pt-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
            <div className="relative flex flex-col items-center">
              <Image
                alt="App screenshot showcasing the main interface"
                src={image2}
                width={2432}
                height={1442}
                className="rounded-xl shadow-2xl ring-1 ring-gray-900/10 object-cover w-full h-auto"
                loading="lazy"
              />

              <Image
                alt="App screenshot showing additional features"
                src={image1}
                width={1216}
                height={721}
                className="rounded-xl shadow-2xl ring-1 ring-gray-900/10 absolute top-0 left-0 object-cover opacity-75 hover:opacity-100 duration-200 ease-in-out w-1/2 h-auto"
                loading="lazy"
              />
            </div>

            <div aria-hidden="true" className="relative">
              <div className="absolute bottom-0 -inset-x-32 dark:-inset-x-0 dark:rounded-b-lg bg-gradient-to-t from-white/95 dark:from-black pt-[5%]" />
            </div>
          </div>
        </div>*/}
        <div className="relative py-16 z-40">
          <HeroVideoDialog
            className="dark:hidden block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.webp"
            thumbnailAlt="Hero Video"
          />
          <HeroVideoDialog
            className="hidden dark:block"
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
            thumbnailSrc="https://startup-template-sage.vercel.app/hero-dark.webp"
            thumbnailAlt="Hero Video"
          />
        </div>
        {/* Feature Mapping */}
        <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-20 md:mt-24 lg:px-8 z-40">
          <dl className="mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 text-gray-600 dark:text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
            {FEATURES.map((feature, index) => (
              <div key={index} className="relative pl-9">
                <dt className="inline font-semibold text-gray-900">
                  <feature.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 h-5 w-5 text-primary"
                  />
                </dt>

                <dd>{feature.desc}</dd>
              </div>
            ))}
          </dl>
        </div>
        <FlickeringGrid
          className="z-0 absolute inset-0 w-full h-full opacity-20"
          squareSize={4}
          gridGap={6}
          color="#60A5FA"
          maxOpacity={0.5}
          flickerChance={0.1}
        />
        {/* Get started for free */}
        <div className="flex flex-col items-center justify-center text-center p-4 md:p-6 lg:p-8 h-[50vh] mt-10 -mb-10 z-40">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Get Started For Free
          </h2>
          <p className="text-xl md:text-2xl lg:text-3xl">
            Build you bot today!
          </p>
          <Button asChild className="mt-10 w-full md:w-auto">
            <Link
              href="/dashboard"
              className="dark:text-white text-lg md:text-base lg:text-lg py-2 px-4 rounded-lg bg-blue-500 hover:bg-blue-600 transition"
            >
              {userId ? "Go to Your Chatbots" : "Get Started"}
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
