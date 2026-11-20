// Materials that show up on a student's portal page without being added in Teacher Desk.
// Keyed by the student's name as it is saved in Teacher Desk (case does not matter).
// Results are still saved to the portal as usual. If a page is also added in Teacher Desk,
// it appears only once.
window.AUTO_MATERIALS = {
  polina: [
    { id: "auto-g36", title: "Grivas p. 36–37 · Exam Practice 1", url: "https://puicumber.github.io/lesson/polina/grivas-36/", kind: "homework", activity: "g36", note: "Review of your mistakes: collocations, open cloze, word formation, transformations." },
    { id: "auto-rte", title: "Return to Earth", url: "https://puicumber.github.io/lesson/polina/return-to-earth/", kind: "lesson", activity: "rte", note: "Listening, vocabulary, Use of English, speaking and writing around a TEDx talk." },
    { id: "auto-read1", title: "Strangers everywhere · reading lesson", url: "https://puicumber.github.io/lesson/polina/reading-1/", kind: "lesson", activity: "read1" },
    { id: "auto-g33", title: "Grivas p. 33–35 · Collocations & en- verbs", url: "https://puicumber.github.io/lesson/polina/grivas-33/", kind: "vocabulary", activity: "g33" }
  ]
};
// Polina is saved in Teacher Desk as "Me".
window.AUTO_MATERIALS.me = window.AUTO_MATERIALS.polina;
