"use client";
import { Link, HStack } from "@navikt/ds-react";
import { DataGrid } from "@navikt/ds-react/PREVIEW";
import { useMemo } from "react";
import { useQueryParam } from "@src/hooks/useQueryParam";
import type { Team } from "@src/types";
import EditTeamModal from "@components/Modal/TeamModals/EditTeamModal";
import DeleteTeamModal from "@components/Modal/deleteTeam/DeleteTeamModal";

interface TeamListProps {
  teams: Team[];
  isAdmin: boolean;
}

type SortOrder = NonNullable<DataGrid.Table.Sorting["sortOrder"]>;

function parseSortOrder(raw: string): SortOrder {
  if (raw === "") return [];
  const [columnId, direction] = raw.split(":");
  if (
    columnId === "name" &&
    (direction === "asc" || direction === "desc")
  ) {
    return [{ columnId, direction }];
  }
  return [];
}

const TeamList = ({ teams, isAdmin }: TeamListProps) => {
  const [sortParam, setSortParam] = useQueryParam("sort", "name:asc");
  const sortOrder = useMemo(() => parseSortOrder(sortParam), [sortParam]);

  const handleSortOrderChange: DataGrid.Table.Sorting["onSortOrderChange"] = (
    newSortOrder,
  ) => {
    const first = newSortOrder[0];
    setSortParam(first ? `${first.columnId}:${first.direction}` : undefined);
  };

  const columns = useMemo<DataGrid.Columns<Team>>(() => {
    const cols: DataGrid.Columns<Team> = [
      {
        id: "name",
        header: "Team",
        isRowHeader: true,
        isSortable: true,
        bodyCell: (team) => (
          <Link data-color="neutral" href={`/teams/${team.id}`}>
            {team.name}
          </Link>
        ),
      },
      {
        id: "members",
        header: "Medlemmer",
        align: "right",
        bodyCell: (team) => `${team.members?.length ?? 0}`,
      },
    ];
    if (isAdmin) {
      cols.push({
        id: "actions",
        header: "Handlinger",
        align: "right",
        bodyCell: (team) => (
          <HStack justify="end" gap="space-8" wrap={false}>
            <EditTeamModal teamId={team.id} size="small" />
            <DeleteTeamModal teamId={team.id} size="small" />
          </HStack>
        ),
      });
    }
    return cols;
  }, [isAdmin]);

  const sortedTeams = useMemo(() => {
    const first = sortOrder[0];
    if (!first) return teams;
    return teams.slice().sort((a, b) => {
      const result = a.name.localeCompare(b.name, "no");
      return first.direction === "asc" ? result : -result;
    });
  }, [teams, sortOrder]);

  return (
    <DataGrid
      columns={columns}
      data={sortedTeams}
      getRowId={(row) => row.id}
      defaultSettings={{ zebraStripes: true }}
    >
      <DataGrid.Table
        layout="auto"
        sorting={{
          allowMultiSort: false,
          sortOrder,
          onSortOrderChange: handleSortOrderChange,
        }}
      />
    </DataGrid>
  );
};

export default TeamList;
