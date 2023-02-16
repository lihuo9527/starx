import { useState, useEffect, useRef } from 'react';
import { debounce } from 'lodash';
import JsBarcode from 'jsbarcode';
import ReactToPrint from 'react-to-print';
// @mui
import { useTheme } from '@mui/material/styles';

import {
    Stack, Card, Table, TableRow, TableBody, TableCell,
    Container, Typography, TableContainer, TablePagination, Dialog,
    DialogTitle, DialogContent, Button, DialogActions,
    InputAdornment, Box, MenuItem, Divider,
} from '@mui/material';

// components
import Iconify from '../../components/Iconify';
import InputStyle from '../../components/InputStyle';
// utils
import { fDateTime } from '../../utils/formatTime';
// hooks
import useSettings from '../../hooks/useSettings';

// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
// sections
import { ProductListHead } from '../../sections/@dashboard/e-commerce/product-list';
// import AddUserDialog from './components/userEdit';
import * as api from '../../services/api-client';
import Loading from '../../components/loading';


const TABLE_HEAD = [
    { id: 'id', label: 'ID', alignCenter: true },
    { id: 'applyNo', label: '预约单号', alignCenter: true },
    { id: 'trackingNumber', label: '运单号[收]', alignCenter: true },
    { id: 'expressCompanyEnum', label: '快递公司', alignCenter: true },
    { id: 'img', label: '商品图片', alignCenter: true },
    { id: 'partNumber', label: '货号', alignCenter: true },
    { id: 'size', label: '尺寸', alignCenter: true },
    { id: 'num', label: '数量', alignCenter: true },
    { id: 'identificationCode', label: '识别码', alignCenter: true },
    { id: 'privateAddress', label: '私人地址', alignCenter: true },
    { id: 'areaNo', label: '货架位置', alignCenter: true },
    { id: 'inInventoryTime', label: '预约日期', alignCenter: true },
    { id: '', label: '操作', alignCenter: true },
];

export default function InventoryManage() {
    const ref = useRef();
    const { themeStretch } = useSettings();
    const theme = useTheme();

    const [inventoryList, setInventoryList] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selected, setSelected] = useState([]);
    const [filterValue, setFilterValue] = useState({
        "applyNo": "",
        "identificationCode": "",
        "partNumber": "",
        "privateAddress": null,
        "trackingNumber": ""
    });
    const [total, setTotal] = useState(0);
    const [dialogVisible, setDialogVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isCodeLoading, setIsCodeLoading] = useState(false);
    const [currentRow, setCurrentRow] = useState({});
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
            const { page } = await api.fetchInventoryList(params, pageValue, rowsPerPage);
            setTotal(page.totalCount);
            setInventoryList(page.list);
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
        setFilterValue({
            "applyNo": "",
            "identificationCode": "",
            "partNumber": "",
            "privateAddress": null,
            "trackingNumber": ""
        });
        setPage(0);
        setIsFilterValueChange(!isFilterValueChange);
    };

    // 每页显示条数切换
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(event.target.value);
        setPage(0);
    };

    const tryPrint = (row = {}) => {
        setCurrentRow(row);
        setDialogVisible(true);
        setIsCodeLoading(true);
        setTimeout(() => {
            JsBarcode("#barcode", row.applyNo);
            setIsCodeLoading(false);
        }, 500);
    };


    // 关闭入仓弹窗
    const onDialogClose = () => {
        setDialogVisible(false);
    }

    
    return (
        <Page title="库存管理">
            <Container maxWidth={themeStretch ? false : 'lg'} sx={{ position: 'relative' }}>
                <HeaderBreadcrumbs
                    heading="库存信息"
                    links={[
                        { name: '库存信息' },
                        { name: '库存管理' },
                    ]}
                />
                <Card>
                    <Stack spacing={2}
                        sx={{ py: 2.5, px: 3, display: 'flex', flexFlow: 'wrap', alignItems: 'center', justifyContent: 'flex-start', maxWidth: '100%' }}>
                        <InputStyle
                            label='预约单号'
                            size='small'
                            stretchStart={240}
                            sx={{ marginTop: '16px', marginRight: '15px !important' }}
                            value={filterValue.applyNo}
                            onChange={(event) => handleFilter('applyNo', event.target.value)}
                            placeholder="请输入预约单号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />

                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='运单号'
                            stretchStart={240}
                            value={filterValue.trackingNumber}
                            onChange={(event) => handleFilter('trackingNumber', event.target.value)}
                            placeholder="请输入快递单号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='货号'
                            stretchStart={240}
                            value={filterValue.partNumber}
                            onChange={(event) => handleFilter('partNumber', event.target.value)}
                            placeholder="请输入货号"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='识别码'
                            stretchStart={240}
                            value={filterValue.identificationCode}
                            onChange={(event) => handleFilter('identificationCode', event.target.value)}
                            placeholder="请输入识别码"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />
                                ),
                            }}
                        />
                        <InputStyle
                            sx={{ marginRight: '15px !important' }}
                            size='small'
                            label='私人地址'
                            stretchStart={120}
                            select
                            value={filterValue.privateAddress}
                            onChange={(event) => handleFilter('privateAddress', event.target.value)}
                            placeholder="是否私人地址"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" />

                                ),
                            }}>
                            <MenuItem value='YES'>是</MenuItem>
                            <MenuItem value='ERROR'>否</MenuItem>
                        </InputStyle>
                        <Button onClick={debounce(onSearch, 300)} sx={{ marginRight: '15px !important', width: 104, maxHeight: 40 }} variant="outlined">
                            查询
                        </Button>
                        <Button onClick={debounce(onReset, 300)} sx={{ marginRight: '15px !important', maxHeight: 40 }} variant="outlined">
                            重置
                        </Button>

                    </Stack>
                    <Scrollbar>
                        <TableContainer sx={{ minWidth: 1800 }}>
                            <Table>
                                <ProductListHead
                                    needCheckBox='false'
                                    headLabel={TABLE_HEAD}
                                    rowCount={inventoryList.length}
                                    numSelected={selected.length}
                                />
                                <TableBody sx={{ px: 2 }}>
                                    {inventoryList.map((row, index) => {
                                        return (
                                            <TableRow hover key={index} tabIndex={-1} >
                                                <TableCell align="center" style={{ minWidth: 100 }}>{row.id}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.applyNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.trackingNumber}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.expressCompanyEnum}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120, display:'flex', justifyContent:"center" }}>
                                                   <img alt="" src={row.img} style={{maxWidth:'55px'}}/>
                                                </TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.partNumber}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.size}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.num}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.identificationCode}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.privateAddress === 'YES' ? '是' : '否'}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{row.areaNo}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 120 }}>{fDateTime(row.inInventoryTime)}</TableCell>
                                                <TableCell align="center" style={{ minWidth: 140 }} >
                                                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
                                                        <Typography onClick={() => tryPrint(row)} color={theme.palette.info.main} variant="body1" style={{ cursor: 'pointer' }}>
                                                            条形码
                                                        </Typography>

                                                    </Stack>
                                                </TableCell>
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
                    />
                    }
                </Card >

                {/* 打印条形码 */}
                <Dialog sx={{ mx: 'auto' }} scroll="paper" maxWidth={'900px'} open={dialogVisible}>
                    <DialogTitle id="scroll-dialog-title">
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pb: 3 }}>
                            <Typography variant="h6"> 打印条形码 </Typography>
                            <Iconify onClick={onDialogClose} icon={'eva:close-fill'} color={theme.palette.grey[800]} />
                        </Stack>
                    </DialogTitle>
                    <DialogContent sx={{ p: 0, width: '850px' }} ref={ref}>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>预约单号：</span><span>{currentRow.applyNo}</span>
                            </Box>
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>运单号[收]：</span><span>{currentRow.trackingNumber}</span>
                            </Box>
                            <Box sx={{ width: '20%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>货号：</span><span>{currentRow.partNumber}</span>
                            </Box>
                        </Stack>
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="flex-start"
                            sx={{ py: 2, px: 3 }}
                        >
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>尺码：</span><span>{currentRow.size}</span>
                            </Box>
                            <Box sx={{ width: '40%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>货架位置：</span><span>{currentRow.areaNo}</span>
                            </Box>
                            <Box sx={{ width: '20%' }}>
                                <span style={{ color: '#637381', fontSize: '14px' }}>识别码：</span><span>{currentRow.areaNo}</span>
                            </Box>
                        </Stack>
                        <Stack sx={{maxHeight:'300px'}}>
                            {isCodeLoading && <Loading />}
                            <canvas id="barcode" />
                        </Stack>
                    </DialogContent>
                    <Divider />
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={onDialogClose} variant="outlined">
                            取消
                        </Button>
                        <Button variant="contained">
                            <ReactToPrint
                                trigger={() => <a style={{ textDecoration: 'none', color: '#fff' }}>打印条形码</a>}
                                content={() => ref.current}
                            />
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container >
            {isLoading && <Loading />}
        </Page >
    );
}
