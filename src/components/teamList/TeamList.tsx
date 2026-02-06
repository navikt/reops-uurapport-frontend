"use client";
import { Link, Table, Box } from "@navikt/ds-react";
import { useState, useMemo } from "react";
import type { Team } from "@src/types";
import EditTeamModal from "@components/Modal/TeamModals/EditTeamModal";
import DeleteTeamModal from "@components/Modal/deleteTeam/DeleteTeamModal";

interface TeamListProps {
  teams: Team[];
  isAdmin: boolean;
}

type SortState = {
  orderBy: string;
  direction: "ascending" | "descending";
};

const TeamList = ({ teams, isAdmin }: TeamListProps) => {
  const [sort, setSort] = useState<SortState>({
    orderBy: "name",
    direction: "ascending",
  });

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => {
      const comparator = a.name.localeCompare(b.name, "no");
      return sort.direction === "ascending" ? comparator : -comparator;
    });
  }, [teams, sort]);

  const handleSort = (sortKey: string) => {
    setSort((prevSort) => ({
      orderBy: sortKey,
      direction:
        prevSort.orderBy === sortKey && prevSort.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  return (
    <Box>
      <Table sort={sort} onSortChange={handleSort} zebraStripes>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader sortKey="name" sortable>
              Team
            </Table.ColumnHeader>
            {isAdmin && (
              <>
                <Table.HeaderCell>Redigere team</Table.HeaderCell>
                <Table.HeaderCell>Slette team</Table.HeaderCell>
              </>
            )}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {sortedTeams.map((team: Team) => {
            return (
              <Table.Row key={team.id}>
                <Table.HeaderCell scope="row">
                  <Link data-color="neutral" href={`/teams/${team.id}`}>
                    {team.name}
                  </Link>
                </Table.HeaderCell>
                {isAdmin && (
                  <>
                    <Table.DataCell>
                      <EditTeamModal teamId={team.id} />
                    </Table.DataCell>
                    <Table.DataCell>
                      <DeleteTeamModal teamId={team.id} />
                    </Table.DataCell>
                  </>
                )}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Box>
  );
};

export default TeamList;
