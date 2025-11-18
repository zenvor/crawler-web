<template>
  <div class="py-12 mt-0">
    <div class="mx-auto transition-all w-full max-w-3xl px-6 sm:px-6 lg:px-8">
      <dl class="grid mx-auto gap-y-10 gap-x-8 lg:gap-y-16">
        <div class="relative pl-16">
          <dt class="text-base font-semibold leading-7 text-gray-900">
            <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-tabler icon-tabler-zoom-in-area-filled w-6 h-6 text-white"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path
                  d="M15 9a6 6 0 0 1 4.891 9.476l2.816 2.817a1 1 0 0 1 -1.32 1.497l-.094 -.083l-2.817 -2.816a6 6 0 0 1 -9.472 -4.666l-.004 -.225l.004 -.225a6 6 0 0 1 5.996 -5.775zm0 3a1 1 0 0 0 -.993 .883l-.007 .117v1h-1l-.117 .007a1 1 0 0 0 0 1.986l.117 .007h1v1l.007 .117a1 1 0 0 0 1.986 0l.007 -.117v-1h1l.117 -.007a1 1 0 0 0 0 -1.986l-.117 -.007h-1v-1l-.007 -.117a1 1 0 0 0 -.993 -.883z"
                  stroke-width="0"
                  fill="currentColor"
                />
                <path
                  d="M3 14a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 0 .883 .993l.117 .007h1a1 1 0 0 1 .117 1.993l-.117 .007h-1a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-1a1 1 0 0 1 1 -1z"
                  stroke-width="0"
                  fill="currentColor"
                />
                <path
                  d="M3 9a1 1 0 0 1 .993 .883l.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 1 1 -1z"
                  stroke-width="0"
                  fill="currentColor"
                />
                <path
                  d="M6 2a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 0 -.993 .883l-.007 .117v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a3 3 0 0 1 2.824 -2.995l.176 -.005h1z"
                  stroke-width="0"
                  fill="currentColor"
                />
                <path
                  d="M11 2a1 1 0 0 1 .117 1.993l-.117 .007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"
                  stroke-width="0"
                  fill="currentColor"
                />
                <path
                  d="M16 2a3 3 0 0 1 2.995 2.824l.005 .176v1a1 1 0 0 1 -1.993 .117l-.007 -.117v-1a1 1 0 0 0 -.883 -.993l-.117 -.007h-1a1 1 0 0 1 -.117 -1.993l.117 -.007h1z"
                  stroke-width="0"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h4 class="text-lg">Find Every Image</h4>
          </dt>
          <dd class="mt-2 text-base leading-7 text-gray-600">
            We use many different methods and strategies to find all relevant images on an website. This includes
            background images, dynamically loaded or embedded images and SVG elements.
          </dd>
        </div>
        <div class="relative pl-16">
          <dt class="text-base font-semibold leading-7 text-gray-900">
            <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-tabler icon-tabler-augmented-reality w-6 h-6 text-white"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                <path d="M12 12.5l4 -2.5" />
                <path d="M8 10l4 2.5v4.5l4 -2.5v-4.5l-4 -2.5z" />
                <path d="M8 10v4.5l4 2.5" />
              </svg>
            </div>
            <h4 class="text-lg">Automatic Image Analysis</h4>
          </dt>
          <dd class="mt-2 text-base leading-7 text-gray-600">
            Every discovered image is analysed to find its dimensions, type, size and name. With more advanced features
            to come in the future.
          </dd>
        </div>
        <div class="relative pl-16">
          <dt class="text-base font-semibold leading-7 text-gray-900">
            <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-tabler icon-tabler-tool w-6 h-6 text-white"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5" />
              </svg>
            </div>
            <h4 class="text-lg">Useful Tools</h4>
          </dt>
          <dd class="mt-2 text-base leading-7 text-gray-600">
            View all images in a grid or list, search for specific ones by name, filter by type and sort by width,
            height and other properties to find exactly what you are looking for.
          </dd>
        </div>
        <div class="relative pl-16">
          <dt class="text-base font-semibold leading-7 text-gray-900">
            <div class="absolute top-0 left-0 flex items-center justify-center rounded-lg w-11 h-11 bg-emerald-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="icon-tabler icon-tabler-download w-6 h-6 text-white"
                width="24px"
                height="24px"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                <path d="M7 11l5 5l5 -5" />
                <path d="M12 4l0 12" />
              </svg>
            </div>
            <h4 class="text-lg">Easy Download</h4>
          </dt>
          <dd class="mt-2 text-base leading-7 text-gray-600">
            Download invididual images or select the ones you want and download them all at once. Alternatively, you can
            also only copy the URLs to the clipboard.
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>
