import words from "./generators.json"

const { adjectives, nouns } = words
const num_adjectives = adjectives.length
const num_nouns = nouns.length

export function GenerateRandomUsername(): string {
    const adjective_index = Math.floor(Math.random() * num_adjectives)
    const noun_index = Math.floor(Math.random() * num_nouns)
    const random_number = Math.floor(Math.random() * 1000)

    return `${adjectives[adjective_index]}_${nouns[noun_index]}_${random_number}` 
}


export function GenerateRandomCredentials(): string {
    let chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let string_length = 32;
    let randomstring = '';
    for (let i=0; i<string_length; i++) {
        let rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }

    return randomstring
}