declare global {
  const enum ButtonSizes {
    NONE = "",
    TINY = "bd-button-tiny",
    SMALL = "bd-button-small",
    MEDIUM = "bd-button-medium",
    LARGE = "bd-button-large",
  }

  const enum OptionTypes {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
  }

  const BdApi: {
    Components: {
      Button: {
        Sizes: typeof ButtonSizes;
      };
    };
    Commands: {
      OptionTypes: typeof OptionTypes;
    };
  };
}

export {};
