import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export type ColumnDef<T extends object> = {
  header: string;
  accessor: (row: T) => any;
  key?: string;
};

export default function DataTable<T extends object>({ title, columns, data }: { title?: string; columns: ColumnDef<T>[]; data: T[] }) {
  return (
    <Table>
      {title ? <TableCaption>{title}</TableCaption> : null}
      <TableHeader>
        <TableRow>
          {columns.map((c, idx) => (
            <TableHead key={c.key ?? idx.toString()}>{c.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            {columns.map((c, j) => {
              const value = c.accessor(row);
              return (
                <TableCell key={(c.key ?? j.toString()) + "-" + i}>
                  {value !== null && value !== undefined ? value : ""}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
