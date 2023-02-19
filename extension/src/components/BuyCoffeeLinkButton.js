/*global chrome*/

const buttonVariants = [
  {
    text: "help author feed his dog",
    emoji: "🐕",
  },
  {
    text: "buy author a coffee",
    emoji: "☕️",
  },
  {
    text: "buy author some pizza",
    emoji: "🍕",
  },
  {
    text: "help author pay his rent",
    emoji: "🏠",
  },
  {
    text: "help author with car fuel",
    emoji: "🚗",
  },
  {
    text: "pay for author's bills",
    emoji: "💸",
  },
  {
    text: "help author go on vacation",
    emoji: "🏝",
  }
];

export default function BuyCoffeeLinkButton() {
  const url = "https://www.buymeacoffee.com/alexsab";
  const buttonColor = "2470da";
  const randomIndex = Math.floor(buttonVariants.length * Math.random());
  const variant = buttonVariants[randomIndex];
  const onLinkClicked = (e) => {
    chrome.tabs.create({ url: url });
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
      If you like this extension, you could
      <a href="#" onClick={onLinkClicked}>
        <img style={{ height: "2.4rem" }} src={`https://img.buymeacoffee.com/button-api/?text=${encodeURIComponent(variant.text)}&emoji=${variant.emoji}&slug=alexsab&button_colour=${buttonColor}&font_colour=ffffff&font_family=Lato&outline_colour=000000&coffee_colour=FFDD00`} />
      </a>
    </div>
  );
}
