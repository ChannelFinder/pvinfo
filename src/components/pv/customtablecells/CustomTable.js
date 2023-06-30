import { TableContainer } from "@mui/material";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import { styled } from '@mui/material/styles';

const CustomTableContainer = styled(TableContainer)(({ theme }) => ({
    [`&.MuiTableContainer-root`]: {
        borderTop: '1px solid #D1D5DB',
        maxHeight: 700
    }
}))

const TableHeaderCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: '#F3F4F6',
        borderColor: "#D1D5DB"
    }
}));

const TableBodyCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.body}`]: {
        borderColor: "#D1D5DB"
    }
}));


export { CustomTableContainer, TableBodyCell, TableHeaderCell };
