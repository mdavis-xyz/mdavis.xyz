for SRC in *.typ
do
  DEST="${SRC%.typ}.svg"
  typst compile $SRC $DEST
done