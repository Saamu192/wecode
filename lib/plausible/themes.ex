defmodule Plausible.Themes do
  @options [
    [key: "Siga o tema do sistema", value: "system"],
    [key: "Branco", value: "light"],
    [key: "Escuro", value: "dark"]
  ]

  def options() do
    @options
  end
end
