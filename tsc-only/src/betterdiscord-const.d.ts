declare module "betterdiscord-const" {
  export const enum ButtonSizes {
    NONE = "",
    TINY = "bd-button-tiny",
    SMALL = "bd-button-small",
    MEDIUM = "bd-button-medium",
    LARGE = "bd-button-large",
  }

  export const enum OptionTypes {
    SUB_COMMAND = 1,
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
  }
}
