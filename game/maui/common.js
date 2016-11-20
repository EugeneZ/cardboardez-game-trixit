/**
 * Each array indicates a tiles exits. The index of the array is the entrance and the number in that index is the index
 * of the exits. Indexes are arrange like this:
 *    0  1
 * 7        2
 * 6        3
 *    5  4
 *
 * So for example, a 4 in the first index of an array means the entrance from the top edge, left side leads to the
 * bottom edge, right side. Thus all tiles have eight unique values numbered 0-7, which each value "mirroring" its own
 * index on the index its pointing at.
 *
 * @type {*[]}
 */
module.exports.tiles = [
    [4, 3, 5, 1, 0, 2, 7, 6],
    [1, 0, 4, 6, 2, 7, 3, 5],
    [4, 7, 3, 2, 0, 6, 5, 1],
    [4, 3, 6, 1, 0, 7, 2, 5],
    [6, 5, 7, 4, 3, 1, 0, 2],
    [5, 4, 6, 7, 1, 0, 2, 3],
    [3, 2, 1, 0, 7, 6, 5, 4],
    [4, 6, 7, 5, 0, 3, 1, 2],
    [6, 2, 1, 5, 7, 3, 0, 4],
    [5, 2, 1, 6, 7, 0, 3, 4],
    [2, 5, 0, 4, 3, 1, 7, 6],
    [4, 5, 3, 2, 0, 1, 7, 6],
    [1, 0, 7, 6, 5, 4, 3, 2],
    [5, 4, 7, 6, 1, 0, 3, 2],
    [6, 7, 5, 4, 3, 2, 0, 1],
    [1, 0, 3, 2, 7, 6, 5, 4],
    [1, 0, 4, 5, 2, 3, 7, 6],
    [6, 4, 5, 7, 1, 2, 0, 3],
    [2, 4, 0, 6, 1, 7, 3, 5],
    [2, 7, 0, 6, 5, 4, 3, 1],
    [6, 2, 1, 4, 3, 7, 0, 5],
    [6, 7, 4, 5, 2, 3, 0, 1],
    [1, 0, 3, 2, 5, 4, 7, 6],
    [3, 6, 5, 0, 7, 2, 1, 4],
    [7, 5, 6, 4, 3, 1, 2, 0],
    [3, 5, 6, 0, 7, 1, 2, 4],
    [6, 3, 5, 1, 7, 2, 0, 4],
    [6, 5, 4, 7, 2, 1, 0, 3],
    [7, 4, 6, 5, 1, 3, 2, 0],
    [2, 7, 0, 5, 6, 3, 4, 1],
    [1, 0, 5, 7, 6, 2, 4, 3],
    [5, 2, 1, 4, 3, 0, 7, 6],
    [3, 4, 5, 0, 1, 2, 7, 6],
    [7, 2, 1, 4, 3, 6, 5, 0],
    [4, 5, 6, 7, 0, 1, 2, 3]
];

/**
 * An array indicating the mirroring positions. When you're standing on an edge, the 0th index on one tile is the 5th
 * index on another.
 * @type {number[]}
 */
module.exports.edgeTranslation = [5, 4, 7, 6, 1, 0, 3, 2];