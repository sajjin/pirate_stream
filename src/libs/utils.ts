export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]) {
    return inputs
      .filter(Boolean)
      .map((input) => {
        if (typeof input === 'string') return input;
        if (typeof input === 'object') {
          return input ? Object.entries(input)
            .filter(([, value]) => value)
            .map(([key]) => key)
            .join(' ') : '';
        }
        return '';
      })
      .join(' ')
      .trim();
  }