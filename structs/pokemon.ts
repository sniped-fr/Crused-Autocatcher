import pokemon from "../data/pokemon.json"

export function solveHint(message: string): string[] {
  if (!message) return [];

  const words = message.split(" ");
  let pokemonHint: string = "";

  if (words[0] === "The" && words[1] === "pokémon" && words[2] === "is") {
    pokemonHint = words.slice(3).join(" ");
  } else {
    for (let i = words.length - 1; i >= 0; i--) {
      if (words[i].includes("_") || i === words.length - 1) {
        pokemonHint = words.slice(i).join(" ");
        break;
      }
    }
  }

  const hintPattern = pokemonHint
    .replace(/\.([^.]*)$/, "$1")
    .replace(/[!\\]/g, "")
    .replace(/_/g, ".");

  function matchesHint(name: string, pattern: string): boolean {
    return name.length === pattern.length &&
      name.split("").every((char, i) =>
        pattern[i] === "." || char.toLowerCase() === pattern[i].toLowerCase()
      );
  }

  const matchingPokemons = pokemon.filter((p) => matchesHint(p, hintPattern));

  if (matchingPokemons.length === 0) return [];

  return matchingPokemons;
}
