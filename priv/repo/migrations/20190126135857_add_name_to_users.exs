defmodule Plausible.Repo.Migrations.AddNameToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :name, :string
      add :company, :string
      add :phone, :string
    end
  end
end
