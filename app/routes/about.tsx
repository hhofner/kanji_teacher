export default function About() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl">About: How It Works</h1>
      <p>
        Oh My Kanji is a simple application meant to encourage you to write Kanji characters more. It is meant
        to be used as a companion application to a book or application that has a structured set of Kanjis. Oh My Kanji
        expects the user to select a set of Kanji characters they will study for the week.
      </p>
      <p>
        Additionally, Oh My Kanji will provide a set of other features that
        complete the Kanji learning experience. Below you can see a list of
        planned features. While not all of these features are implemented yet,
        they are planned for the future.
      </p>
      <h2 className="text-2xl">Planned features (in no particular order)</h2>
      <ul className="space-y-2">
        <li>End of the week Kanji tests</li>
        <li>Individual Kanji Pages</li>
        <li>Study Kanji meanings</li>
        <li>Study Kanji readings</li>
        <li>Study Kanji vocabulary</li>
        <li>Kanji sets</li>
        <li>More statistics</li>
      </ul>
      <p>
        If you're interested in this project and would like to see it developed
        further (ie, as a native app, an API, or anything else), then consider <a href="https://www.buymeacoffee.com/hhofner">donating</a>,
        sending me a message on <a href="https://twitter.com/hofner_pls">X</a> or <a href="https://mozilla.social/@hans">Mastodon</a>.
      </p>
    </div>
  );
}
