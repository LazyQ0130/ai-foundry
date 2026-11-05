// Deliberate regression fixture: default hides the named inject requirement.
export const inject=['serviceThatDoesNotExist'];
export function apply(){throw Error('named apply must never run with missing inject');}
export default function(){throw Error('wrong default export regression');}
