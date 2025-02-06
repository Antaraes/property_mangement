import { cn } from "@/lib/utils";
import { FC } from "react";

interface FooterProps {}

const Footer: FC<FooterProps> = ({}) => {
  return (
    <>
      {/* ========== FOOTER ========== */}
      <footer className="w-full mx-auto px-4 my-10 sm:px-6 lg:px-8">
        <div className="py-6 border-t border-gray-200 dark:border-neutral-700">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <p className="text-xs text-gray-600 dark:text-neutral-400">© 2025 House LLC.</p>
            </div>
            {/* End Col */}
            {/* List */}
            <ul className="flex flex-wrap items-center">
              <li className="inline-block relative pe-4 text-xs last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:rounded-full before:bg-gray-400 dark:text-neutral-500 dark:before:bg-neutral-600">
                <a
                  className="text-xs text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                  href="#"
                >
                  X (Twitter)
                </a>
              </li>
              <li className="inline-block relative pe-4 text-xs last:pe-0 last-of-type:before:hidden before:absolute before:top-1/2 before:end-1.5 before:-translate-y-1/2 before:size-[3px] before:rounded-full before:bg-gray-400 dark:text-neutral-500 dark:before:bg-neutral-600">
                <a
                  className="text-xs text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                  href="#"
                >
                  Dribbble
                </a>
              </li>
              <li className="inline-block pe-4 text-xs">
                <a
                  className="text-xs text-gray-500 underline hover:text-gray-800 hover:decoration-2 focus:outline-none focus:decoration-2 dark:text-neutral-500 dark:hover:text-neutral-400"
                  href="#"
                >
                  Github
                </a>
              </li>
            </ul>

            {/* End List */}
          </div>
          <div className="w-full group/card mt-3">
            <div
              className={cn(
                " cursor-pointer overflow-hidden relative card h-96 rounded-md shadow-xl   mx-auto backgroundImage flex flex-col p-4 items-center justify-center",
                "bg-[url(https://images.unsplash.com/photo-1544077960-604201fe74bc?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1651&q=80)] bg-cover"
              )}
            >
              <div className="absolute w-full h-full top-0 left-0 transition duration-300 group-hover/card:bg-black opacity-60"></div>

              <div className="text content">
                <h1 className="font-bold text-5xl md:text-9xl text-gray-50 text-center relative z-10">
                  Property Listings
                </h1>
                <p className="font-normal text-sm  text-gray-50 relative z-10 my-5">
                  Explore a wide range of properties available for sale or rent. Find your ideal
                  home with detailed descriptions and high-quality images.
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
      {/* ========== END FOOTER ========== */}
    </>
  );
};

export default Footer;
