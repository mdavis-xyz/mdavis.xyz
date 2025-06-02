# Google Keep Image Cache Browser Extension

In [Google Keep](https://keep.google.com/) you can add images (e.g. photos) to notes. 
When you use the Keep app on Android, the images are saved locally, so browsing them is quick.
However each time you revisit the Google Keep web page in a browser to look at those notes, it will re-download the images. This is slow and wastes your laptop battery. 

I wrote a Firefox browser extension which saves ('caches') the images locally, so that they appear almost instantly. It still can take many seconds for an empty note to be loaded, but once the text of the note appears, any attached images should appear instantly, instead of many seconds later.
This video shows the difference between browsing with a mediocre quality internet connection with the extension (left) and without (right).

<video autoplay loop class="video appear"  width=1500 height=500 autobuffer muted playsinline video-auto-ctrl  preload defaultMuted>
   <source src="both.webm" type="video/webm">
   <source src="both.mp4" type="video/mp4">
</video>


You can install it for free from [the Firefox browser add-on site](https://addons.mozilla.org/en-US/firefox/addon/google-keep-image-cache/). The code is available on [GitLab](https://gitlab.com/MatthewDavis/google-keep-image-cache-extension).
