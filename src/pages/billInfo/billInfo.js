import { sentenceCase } from 'change-case';
import { useState, useEffect, React } from 'react';
import { debounce } from 'lodash';
// @mui
import { useTheme } from '@mui/material/styles';
import {
    Stack, Card, Table, TableRow, Checkbox, TableBody,
    TableCell, Container, Typography, TableContainer,
    TablePagination, Dialog, DialogTitle, DialogContent,
    DialogContentText, Button, DialogActions, InputAdornment,
    Box, MenuItem, Tab, Tabs, Backdrop, CircularProgress
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
// components
import Iconify from '../../components/Iconify';
import InputStyle from '../../components/InputStyle';
// redux
import { useDispatch } from '../../redux/store';
// utils
import { fDateTime } from '../../utils/formatTime';
// hooks
import useSettings from '../../hooks/useSettings';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Loading from '../../components/loading';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { ProductListHead } from '../../sections/@dashboard/e-commerce/product-list';
import { setGlobalMessage } from '../../redux/slices/global';
// import AddUserDialog from './components/userEdit';
import * as api from '../../services/api-client';
import { baseUrl } from '../../services/baseUrl';

const TABLE_HEAD = [
    { id: 'id', label: 'ID', alignCenter: true },
    { id: 'orderTypeEnum', label: '支付类型', alignCenter: true },
    { id: 'payChannelEnum', label: '支付渠道', alignCenter: true },
    { id: 'name', label: '用户名', alignCenter: true },
    { id: 'identificationCode', label: '识别码', alignCenter: true },
    { id: 'rechargeAmount', label: '金额', alignCenter: true },
    { id: 'createTime', label: '订单时间', alignCenter: true },
];


export default function BillInfo() {
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();
    const [billList, setBillList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [tab, setTab] = useState('ADD');
    const [isLoading, setIsLoading] = useState(false);
    const token = localStorage.getItem('accessToken');
    useEffect(() => {
        getList();
    }, [rowsPerPage, tab]);

    const getList = async (pageValue = 1) => {
        setIsLoading(true);
        try {
            const { page } = await api.fetchBillList({ chargeTypeEnum: tab }, pageValue, rowsPerPage);
            setTotal(page.totalCount);
            setBillList(page.list);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    };

    const payTypeEnum = (value) => {
        switch (value) {
            case 'SELL':
                return '出售';
            case 'DOMESTIC':
                return '境内';
            case 'LIFT':
                return '自提';
            case 'BALANCE_CHARGE':
                return '余额充值';
            case 'PRIVATE_IN_POSITIONS':
                return '私人仓入库';
            case 'FORWARD':
                return '转寄预扣';
            case 'FORWARD_RETURN':
                return '转寄退补';
            case 'WORK_ORDER':
                return '问题包裹';
            case 'LONG_STORAGE_FEE':
                return '长期仓储费';
            default:
                return '长期仓储费';
        }
    }

    const _payChannelEnum = (value) => {
        switch (value) {
            case ' MANUAL':
                return '管理员';
            case 'ALI_PAY':
                return '支付宝';
            case 'BALANCE':
                return '余额';
            default:
                return '管理员';
        }
    }
    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const handleChange = (event, newValue) => {
        setTab(newValue);
    };

    return (
        <Page title="账单信息">
            <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
                <HeaderBreadcrumbs
                    heading="账单信息"
                    links={[
                        { name: '账单信息' },
                        { name: '用户资料' },
                    ]}
                />
                <Card>
                    <Stack>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={tab} onChange={handleChange} sx={{ marginLeft: '10px' }}>
                                <Tab value='ADD' label="充值" />
                                <Tab value='DEDUCT' label="扣费" />
                            </Tabs>
                        </Box>
                    </Stack >
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800, marginTop: '10px' }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={TABLE_HEAD}
                                    rowCount={billList.length}
                                />
                                <TableBody sx={{ px: 2 }}>
                                    {billList.map((row) => {
                                        const { id, associatedNo, name, identificationCode, orderTypeEnum, payChannelEnum, createTime, rechargeAmount } = row;
                                        return (
                                            <TableRow
                                                hover
                                                key={id}
                                                tabIndex={-1}
                                                role="checkbox"

                                            >
                                                <TableCell align="center" style={{ minWidth: 100 }}>{id}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{payTypeEnum(orderTypeEnum)}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{_payChannelEnum(payChannelEnum)}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{name}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{identificationCode}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{rechargeAmount}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{fDateTime(createTime)}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                                {total === 0 && isLoading === false && (
                                    <TableBody>
                                        <TableRow>
                                            <TableCell align="center" colSpan={12}>
                                                <Box sx={{ py: 3 }}>
                                                    暂无数据
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                )}
                            </Table>
                        </TableContainer>
                    </Scrollbar>
                    {total > 0 && <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={total}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(event, value) => {
                            setPage(value);
                            getList(value + 1);
                        }}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />}
                    {total > 0 && <Button startIcon={<DownloadIcon />} variant="contained" style={{ position: 'absolute', bottom: '16px', left: '10px' }}>
                        <a style={{ color: '#fff', textDecoration: 'none' }} rel='noreferrer' target="_blank" href={`${baseUrl}/charge/ad/export?chargeTypeEnum=${tab}&token=${token}`} >导出exl表格</a>
                    </Button>
                    }
                </Card >
            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
