defmodule Plausible do
  @moduledoc """
  Plausible keeps the contexts that define your domain
  and business logic.

  Contexts are also responsible for managing your data, regardless
  if it comes from the database, an external API or others.
  """

  @spec v2?() :: boolean()
  def v2?() do
    Plausible.DataMigration.NumericIDs.ready?()
  end
end
