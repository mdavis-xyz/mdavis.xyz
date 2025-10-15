[_Staves_](https://typst.app/universe/package/staves) is a [Typst](https://typst.app/) package written by me for drawing writing musical scales.

```
#import "@preview/staves:0.1.0": major-scale
#major-scale("treble", "D", 4)
```

![D Major](examples/d-major.svg)


```
#import "@preview/staves:0.1.0": arpeggio
#arpeggio("bass", "g", 2, note-duration: "crotchet")
```

![G Minor Arpeggio](examples/g-minor-arpeggio.svg)

```
#import "@preview/staves:0.1.0": stave
#stave("alto", "c", notes: ("C3", "D#4", "F3"), width: 7cm)
```

![Custom Notes](examples/custom-notes.svg)


## Packaging

Typst packages are distributed in a unique way, compared to something like Python's PyPi. The workflow is that I've got one git repo for my package, with the code, docs, unit tests etc. Then to publish it I need to copy a subset of the files into a particular new folder in Typst's monorepo. This monorepo contains all Typst packages. Then when I want to update my package, I need to copy the updated subset of files to a another folder within the monorepo. e.g. if I want to update one line, I must duplicate all files in my package into a new folder beside the old version. So the Package versioning is orthogonal to git's versioning. I think they do this to optimise download speed, although I wonder how this will scale after a decade of changes to thousands of packages.

## Implementation

Implementing the graphical side of my musical scales package was easy. I just used CeTZ to draw 5 horizontal lines and overlay symbols from SVG files. Although Typst's lack of equivalent to LaTeX's `\textwidth` makes auto-stretching the lines to the full page width tricky.

Codifying the musical theory and arithmetic was harder.  Each physical key on the piano can actually be one of several symbols. (E.g. is the note 2 semitones above B flat a C natural, B sharp, or D double flat?) Typst does not have a way to define custom data classes, so this ended up being a bit fiddly.

Typst package documentation must be written in markdown, not Typst, and I wanted my documentation to include many examples compiled from actual code. So I wrote a lot of tooling to generate documentation in different formats. 


This package is available now [on Typst Universe, as "Staves"](https://typst.app/universe/package/staves). The source code is available [on GitHub](https://github.com/mdavis-xyz/staves-typst).

