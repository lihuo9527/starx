import { useState, useEffect } from 'react';
import { debounce } from 'lodash';
// @mui
import { useTheme } from '@mui/material/styles';
import {
    Stack, Card, Table, TableRow, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, Button, DialogActions,
    InputAdornment, Box, Divider,
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
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
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { ProductListHead } from '../../sections/@dashboard/e-commerce/product-list';
import { setGlobalMessage } from '../../redux/slices/global';
// import AddUserDialog from './components/userEdit';
import * as api from '../../services/api-client';
import Loading from '../../components/loading';

const TABLE_HEAD = [
    { id: 'id', label: 'ID', alignCenter: true },
    { id: 'area', label: '区域', alignCenter: true },
    { id: 'rackNo', label: '货架编号', alignCenter: true },
    { id: 'shelfNo', label: '货架层', alignCenter: true },
    { id: 'maxNum', label: '最大可放置数', alignCenter: true },
    { id: 'takeNum', label: '已放置数量', alignCenter: true },
    { id: 'createTime', label: '创建日期', alignCenter: true }
];

export default function ShelfManage() {
    const { themeStretch } = useSettings();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [shelfList, setShelfList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterValue, setFilterValue] = useState({
        area: '',
        rackNo: ''
    });
    const [total, setTotal] = useState(0);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isButtonLoading, setIsButtonLoading] = useState(false);
    const [shelfForm, setShelfForm] = useState({
        area: '',
        maxNum: '',
        rackNo: '',
        shelfNo: '',
    });
    const [isFilterValueChange, setIsFilterValueChange] = useState(false);
    useEffect(() => {
        getList();
    }, [rowsPerPage, isFilterValueChange]);

    const getList = async (pageValue = 1) => {
        setIsLoading(true)
        try {
            const params = {
                ...filterValue,
            };
            const { page } = await api.fetchShelfList(params, pageValue, rowsPerPage);
            setTotal(page.totalCount);
            setShelfList(page.list);
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false)
    };

    // 搜索条件设置
    const handleFilter = (key, value) => {
        setFilterValue({ ...filterValue, [key]: value });
    };

    // 点击搜索按钮触发事件
    const onSearch = () => {
        setPage(0);
        getList();
    };

    // 点击重置按钮触发事件
    const onReset = () => {
        setFilterValue({ area: '', rackNo: '' });
        setPage(0);
        setIsFilterValueChange(!isFilterValueChange);
    };

    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };



    // 打开新增货架弹窗
    const onAddShelf = () => {
        setDialogVisible(true);
    };

    // 关闭新增货架弹窗
    const onDialogClose = () => {
        setShelfForm({
            id: '',
            takeNum: '',
            area: '',
            maxNum: '',
            rackNo: '',
            shelfNo: '',
            createTime: '',
        });
        setDialogVisible(false);
    }

    const addShelf = async () => {
        setIsButtonLoading(true);
        let result = {};
        try {
            result = await api.addShelf(shelfForm);
            if (result.msg === 'success') {
                getList();
                dispatch(
                    setGlobalMessage({
                        variant: 'success',
                        msg: '新增成功！',
                    })
                );
                setDialogVisible(false);
                setIsButtonLoading(false);
                return;
            }
        } catch (e) {
            console.log(e);
        }
        dispatch(
            setGlobalMessage({
                variant: 'error',
                msg: result.msg || '新增失败！',
            })
        );
        setIsButtonLoading(false);
    }

    return (
        <Page title="货架管理">
            <Container maxWidth={themeStretch ? false : 'lg'} >
                <HeaderBreadcrumbs
                    heading="货架信息"
                    links={[
                        { name: '货架信息' },
                        { name: '货架管理' },
                    ]}
                />
                <Card>
                    <Stack>
                        <Stack spacing={2} direction={{ xs: 'column', md: 'row' }} sx={{ py: 2.5, px: 3 }}>
                            <InputStyle
                                label='区域'
                                size='small'
                                stretchStart={240}
                                value={filterValue.area}
                                onChange={(event) => handleFilter('area', event.target.value)}
                                placeholder="请输入区域"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />

                                    ),
                                }}
                            />
                            <InputStyle
                                size='small'
                                label='货架编号'
                                stretchStart={240}
                                value={filterValue.rackNo}
                                onChange={(event) => handleFilter('rackNo', event.target.value)}
                                placeholder="请输入货架编号"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <Button onClick={debounce(onSearch, 300)} sx={{ width: 104, maxHeight: 40 }} variant="outlined">
                                查询
                            </Button>

                            <Button onClick={debounce(onReset, 300)} sx={{ maxHeight: 40 }} variant="outlined">
                                重置
                            </Button>
                            <Button onClick={onAddShelf} sx={{ position: 'absolute', right: '30px', top: '24px' }} variant="outlined">
                                新增货架
                            </Button>
                        </Stack>
                    </Stack >
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 800 }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={TABLE_HEAD}
                                    rowCount={shelfList.length}
                                    numSelected={selected.length}
                                // onSelectAllClick={handleSelectAllClick}
                                />
                                <TableBody sx={{ px: 2 }}>
                                    {shelfList.map((row) => {
                                        const { id, takeNum, area, maxNum, rackNo, shelfNo, createTime } = row;

                                        const isItemSelected = selected.indexOf(id) !== -1;

                                        return (
                                            <TableRow
                                                hover
                                                key={id}
                                                tabIndex={-1}
                                                role="checkbox"
                                                selected={isItemSelected}
                                                aria-checked={isItemSelected}
                                            >
                                                <TableCell align="center" style={{ minWidth: 100 }}>{id}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{area}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{rackNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{shelfNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{maxNum}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 160 }}>{takeNum}</TableCell>
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
                    {total > 0 &&
                        <TablePagination
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
                        />
                    }

                </Card >
                {/* 新增货架 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'800px'} open={dialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 新增货架 </Typography>
                            <Iconify onClick={onDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '720px' }}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="区域"
                                style={{ width: '50%', marginRight: 10 }}
                                placeholder="请输入区域"
                                value={shelfForm.area}
                                onChange={(e) => setShelfForm({ ...shelfForm, area: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                label="货架编号"
                                style={{ width: '50%', marginLeft: 10 }}
                                placeholder="请输入货架编号"
                                value={shelfForm.rackNo}
                                onChange={(e) => setShelfForm({ ...shelfForm, rackNo: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <InputStyle
                                label="货架层"
                                style={{ width: '50%', marginRight: 10 }}
                                placeholder="请输入货架层"
                                value={shelfForm.shelfNo}
                                onChange={(e) => setShelfForm({ ...shelfForm, shelfNo: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                            <InputStyle
                                label="最大放置数"
                                style={{ width: '50%', marginLeft: 10 }}
                                placeholder="请输入最大可放置数"
                                value={shelfForm.maxNum}
                                onChange={(e) => setShelfForm({ ...shelfForm, maxNum: e.target.value })}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start" />
                                    ),
                                }}
                            />
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onDialogClose} variant="outlined">
                            取消
                        </Button>
                        <LoadingButton
                            onClick={addShelf}
                            loading={isButtonLoading}
                            variant="contained"
                        >确认</LoadingButton>
                    </DialogActions>
                </Dialog>
                
            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
