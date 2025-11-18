<template>
  <div class="py-12 mt-20">
    <div class="mx-auto transition-all w-full max-w-7xl px-6 sm:px-6 lg:px-8">
      <div>
        <section>
          <h2 class="text-3xl md:text-4xl font-semibold mb-5">Frequently asked questions</h2>
          <p class="text-gray-700">
            If you can't find what you're looking for,
            <a href="mailto:luckxiaomi@gmail.com" class="underline">write us a message</a> and we'll get back to you.
          </p>
          <div class="grid lg:grid-cols-2 md:gap-x-16 gap-y-2 md:gap-y-3 mt-6">
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">What is Image Extractor?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  Image Extractor is an easy to use tool that allows you to extract, view and download images from any
                  public website. Simply paste the URL of the website into the input field and click "Extract" to start
                  the process. After a few seconds you will see most or even all of the images found on the website.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">How can I find specific images?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  You can view the found images in a grid or list and explore them by <strong>sorting</strong> them by
                  name, type, dimensions, width, height or the actual file size. Additionally you can
                  <strong>search</strong> for images by their name, size or type/file format. This makes it really easy
                  to find exactly the images you need.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">What other tools are available?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  In case some images are very bright, you can <strong>switch to a dark background</strong> to make them
                  more visible. You can use the <strong>copy the URL</strong> of one or more images by clicking the link
                  icon or the <em>Copy selected URLs</em> button. You can also very easily <strong>download</strong>
                  indiviual images or <strong>multiple images</strong> at once by selecting them and then downloading
                  them all in a <strong>ZIP archive</strong>.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">Is it free?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                Yes, Image Extractor is <strong>free to use</strong> without creating an account! <br />
                There is an hourly and daily limit on the number of extractions you can run to prevent abuse. However,
                you can extend these limits by creating an account or subscribing to a premium plan.
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">How can I download images?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  After the extraction process is finished you will find a list of all the images found on the website
                  you entered. You can then use the
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="icon-tabler icon-tabler-download inline-block h-5"
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                    <path d="M7 11l5 5l5 -5"></path>
                    <path d="M12 4l0 12"></path>
                  </svg>
                  button to download individual images.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">Can I download multiple images at once?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  Of course, you can select them by clicking the images and the use the "Download selected" button on
                  the left to download all selected images in a ZIP file.
                  <strong>This can take some time depending on how many images you selected.</strong> Note that there is
                  a chance that some images cannot be downloaded and won't be included in the ZIP file.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">The extraction does not work. Why?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  There are several reasons why the extraction might fail. The website you entered might be not be
                  publicly accessible or it might be protected by a login. Very slow or large websites might also cause
                  issues.
                </span>
                <span>
                  And sometimes there are a lot of people using Image Extractor at the same time which can cause
                  performance issues on our side. In this case you should try again later or try a different website. We
                  are continuously working on improving the performance of our service.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">The download does not work. Why?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  Sometimes other websites block the download of images from their website. In this case you can
                  right-click the images and press "Save image as..." or try to open the image in a new tab and download
                  it from there.
                </span>
                <span>
                  When trying to download multiple images at once, some images might not be included in the ZIP file,
                  because they could not be downloaded. In this case you can try to download them individually. If the
                  download does not work at all, please contact us.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">How does it work?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  Everytime you start the extraction process the website you entered is openend in a
                  <strong>Google Chrome</strong> browser. We then apply multiple different methods to find all the
                  images (and even SVG elements) on the website. After that the images are analyzed to show useful
                  information like type, name and size.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">Does it work with dynamic websites?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  Yes. Every website is viewed just like you view them in your browser. We use the latest version of the
                  Google Chrome browser to process the websites you provide. After loading your website we execute
                  JavaScript and wait for any requests to finish before starting the extraction process.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">How many images are extracted?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                <span>
                  After the server navigates to the website you provided, it <strong>scrolls down</strong> really fast
                  for a few seconds to find as many images as possible. Every image that the website loads in those
                  first ~10 seconds is then sent back to you. Tracking pixels and missing or invalid images are
                  automatically removed.
                </span>
              </p>
            </article>
            <article>
              <h4 class="mt-10 text-lg font-semibold mb-3">What does "Image preview not available" mean?</h4>
              <p class="text-gray-700 text-base leading-relaxed prose max-w-none">
                This can have several reasons. The most common is that the webserver, the image is stored on, does not
                allow the image to be loaded/shown on other websites. If that is the case, we cannot display the image
                on the page. However, it is very likely that you are still able to
                <strong>download the image</strong>. If that fails too, try to
                <strong>open the image in a new tab</strong>.
              </p>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
