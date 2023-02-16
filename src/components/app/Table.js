import PropTypes from 'prop-types';
import { forwardRef, Fragment, useCallback, useEffect, useImperativeHandle, useState } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Table, TableContainer, TableBody, TableRow,
  TableCell, TablePagination, Checkbox, Stack, Button, Box,
  Typography
} from '@mui/material';
import Scrollbar from 'src/components/Scrollbar';
// import SearchNotFound from 'src/components/SearchNotFound';
// components
import { TableHeadCustom } from 'src/components/table';
import EmptyContent from 'src/components/EmptyContent';
import Iconify from 'src/components/Iconify';


// ----------------------------------------------------------------------

const i18NModuleKey = 'components.app.table';

const AppTable = forwardRef(({
  tableColumns,
  list = [],
  summary,
  minRows = 0,
  single = false,
  total = 0,
  defaultRows = 10,
  rowKey = 'id',
  rowSelection = true,
  btnText = {},
  clearList,
  getI18nText,
  batch = true,
  onLoad,
  onAdd,
  onEdit,
  onDelete,
  actions,
  sx = {},
  topRightNode,
  topLeftNode,
}, ref) => {
  const theme = useTheme();
  // const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRows);

  const [hasAction, setHasAction] = useState(false);
  const [columns, setColumns] = useState();
  const [currentList, setCurrentList] = useState();
  // const [orderBy, setOrderBy] = useState('createdAt');

  // const handleRequestSort = (property) => {
  // const isAsc = orderBy === property && order === 'asc';
  // setOrder(isAsc ? 'desc' : 'asc');
  // setOrderBy(property);
  // };

  useEffect(() => {
    if (!list[page]) {
      // 第一页没数据 就请求第一页
      if (!page || list[0]) {
        onLoad(page, rowsPerPage);
      } else {
        setPage(0);
      }
    }
  }, [list, page, rowsPerPage, onLoad]);

  useEffect(() => {
    if (list) setCurrentList(list[page]);
  }, [list, page]);

  // 转换标签文案
  useEffect(() => {
    if (columns && getI18nText) {
      columns.map(v => {
        if (!v.label && getI18nText) {
          v.label = getI18nText(v.id, 'label', getI18nText(v.id, 'label', undefined, i18NModuleKey));
        }
        return v;
      });
    }
  }, [columns, getI18nText]);

  // 是否显示操作按钮
  useEffect(() => {
    setHasAction(!!onEdit || !!onDelete || !!actions);
  }, [onEdit, onDelete, actions]);

  // 列表变化时检查可选项
  useEffect(() => {
    if (currentList) {
      setSelected(v => {
        if (!rowKey || !currentList.length) return [];
        const selected = [];
        for (let i = 0, len = currentList.length; i < len; i += 1) {
          const key = currentList[i][rowKey];
          if (v.includes(key)) selected.push(key);
        }
        return selected;
      })
    }
  }, [currentList, rowKey]);

  // 填充操作按钮
  useEffect(() => {
    if (tableColumns) {
      setColumns([
        ...tableColumns,
        ...(hasAction ? [{ id: '_action' }] : []),
      ])
    }
  }, [tableColumns, hasAction]);

  // 全选/全不选
  const handleSelectAllClick = useCallback((checked) => {
    if (single) return;
    if (checked) {
      const selected = currentList?.map((n, i) => rowKey ? n[rowKey] : i);
      setSelected(selected);
      return;
    }
    setSelected([]);
  }, [currentList, rowKey, single]);

  // 左侧选择
  const handleClick = useCallback((rowKey) => {
    if (single) {
      setSelected(v => v[0] === rowKey ? [] : [rowKey]);
    } else {
      const selectedIndex = selected.indexOf(rowKey);
      let newSelected = [];
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, rowKey);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
      }
      setSelected(newSelected);
    }
  }, [selected, single]);

  // 修改每页行数
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    // setPage(0);
    clearList();
  };
  // 外部调用内部函数
  useImperativeHandle(ref, () => ({
    // 重载数据
    reload: (p) => {
      onLoad(p === undefined ? page : p, rowsPerPage);
    },
    // 清空数据
    getCurrentPage: () => ({
      page,
      rowsPerPage,
    }),
    // 获取勾选项
    getSelected: () => [selected, currentList?.filter((v, i) => selected.includes(rowKey ? v[rowKey] : i))],
  }));

  const actionsNode = useCallback((key, item) => {
    /* 编辑 */
    const EditBtn = onEdit ? <Typography noWrap sx={{
      color: theme.palette.info.main,
      cursor: 'pointer'
    }} onClick={() => onEdit(item)}>
      {getI18nText('edit', 'button', undefined, i18NModuleKey)}
    </Typography> : null;
    /* 删除 */
    const DeleteBtn = onDelete ? <Typography noWrap sx={{
      cursor: 'pointer',
      color: theme.palette.error.main,
    }} onClick={() => onDelete(key)}>
      {getI18nText('delete', 'button', undefined, i18NModuleKey)}
    </Typography> : null;

    if (actions) return actions(item, {
      EditBtn,
      DeleteBtn,
    });
    return <>
      {EditBtn}
      {DeleteBtn}
    </>
  }, [onEdit, getI18nText, onDelete, actions, theme]);

  const isNotFound = currentList && !currentList.length;
  // const emptyRows = !isNotFound && minRows && minRows > (currentList?.length || 0) ? minRows - (currentList?.length || 0) : 0;

  return (<Box sx={sx}>
    <Stack
      spacing={2}
      direction="row"
      sx={{
        justifyContent: 'space-between',
        px: 3,
        pt: 2.5,
        minHeight: (batch && (onAdd || topLeftNode || topRightNode)) ? 72 : 0,
      }}
    >
      <Stack direction="row" spacing={2} sx={{
        height: '100%'
      }}>
        {onAdd && <>
          <Button onClick={() => onAdd(selected)} variant="contained" startIcon={<Iconify icon="eva:plus-fill" />}>
            {btnText.add || getI18nText('add', 'button', undefined, i18NModuleKey)}
          </Button>
        </>}
        {topLeftNode && topLeftNode(selected)}
      </Stack>

      {((batch && rowSelection) || topRightNode) && <Stack direction="row" spacing={1.5} sx={{
        pb: 2.5
      }}>
        {topRightNode && topRightNode(selected)}
        {onDelete && <Button disabled={!selected.length} onClick={() => onDelete(selected)}
          startIcon={<Iconify icon="ep:delete" />}
          sx={{
            mr: -1,
            color: theme.palette.text.primary,
          }}>
          {btnText.delete || getI18nText('delete', 'button', undefined, i18NModuleKey)}
        </Button>}
      </Stack>}
    </Stack>
    {columns?.length && <Scrollbar>
      <TableContainer sx={{
        minWidth: 800,
        minHeight: minRows ? minRows * 40 + 32 : 'auto',
      }}>
        <Table>
          <TableHeadCustom
            // order={order}
            // orderBy={orderBy}
            headLabel={columns}
            rowCount={currentList?.length}
            numSelected={selected.length}
            // onSort={handleRequestSort}
            onSelectAllRows={rowSelection ? handleSelectAllClick : undefined}
            selectAllDisabled={single}
            cellSx={{
              height: 32,
              py: 0,
              boxSizing: 'border-box',
              whiteSpace: 'nowrap',
            }}
          />

          <TableBody sx={{
            verticalAlign: 'top'
          }}>
            {currentList?.map((item, index) => {
              const key = rowKey ? item[rowKey] : index;
              const isItemSelected = selected.indexOf(key) !== -1;

              return <TableTr key={key}
                columns={columns}
                rowSelection={rowSelection}
                info={item}
                isSelected={isItemSelected}
                position={[page, rowsPerPage, index]}
                onSelect={() => handleClick(key)}
                actions={actionsNode(key, item)} />
            })}
            {/* {emptyRows > 0 && (
              <TableRow style={{ height: 40 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )} */}

            {summary && <TableTr key="summary" rowSelection={rowSelection}
              sx={{
                fontWeight: 'bold'
              }}
              columns={columns}
              info={summary} />}
          </TableBody>

          {isNotFound && (
            <TableBody>
              <TableRow>
                <TableCell align="center" colSpan={columns?.length + 1}>
                  <EmptyContent sx={{ pt: 8 }} />
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>
    </Scrollbar>}
    <TablePagination
      rowsPerPageOptions={[5, 10, 25]}
      component="div"
      count={total}
      rowsPerPage={rowsPerPage}
      page={page}
      onPageChange={(event, value) => setPage(value)}
      onRowsPerPageChange={handleChangeRowsPerPage}
      sx={{
        '.css-l6w8pl-MuiToolbar-root-MuiTablePagination-toolbar': {
          height: 56
        }
      }}
    />
  </Box>);
});

AppTable.propTypes = {
  tableColumns: PropTypes.array, // 显示内容
  minRows: PropTypes.number, // 最少显示多少行高度
  defaultRows: PropTypes.number, // 默认行数
  single: PropTypes.bool, // 单选
  list: PropTypes.array.isRequired, // 数据 [[第一页数据], [第二页数据]]
  summary: PropTypes.object, // 汇总数据
  sx: PropTypes.object,
  total: PropTypes.number.isRequired, // 数据总数
  rowKey: PropTypes.string, // 识别标识 - 如删除时要传的值, 默认id
  rowSelection: PropTypes.bool, // 是否支持多选
  batch: PropTypes.bool, // 是否显示批量操作, 默认true
  btnText: PropTypes.object, // 覆盖内部的按钮文案
  getI18nText: PropTypes.func, // 本地化翻译
  clearList: PropTypes.func.isRequired, // 清空数据, 用于触发切换到第一页 并请求数据
  onLoad: PropTypes.func.isRequired,
  onAdd: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  actions: PropTypes.func,
  topRightNode: PropTypes.func, // 表格右上扩展按钮
  topLeftNode: PropTypes.func, // 表格左上扩展按钮
};

export default AppTable;

// ----

TableTr.propTypes = {
  info: PropTypes.object.isRequired,
  rowSelection: PropTypes.bool,
  isSelected: PropTypes.bool,
  columns: PropTypes.array,
  onSelect: PropTypes.func,
  actions: PropTypes.element,
  sx: PropTypes.object,
  position: PropTypes.array,
};

function TableTr(props) {
  const theme = useTheme();
  const {
    info,
    isSelected,
    onSelect,
    columns,
    actions,
    rowSelection,
    sx,
    position = [],
  } = props;

  return <TableRow
    hover
    tabIndex={-1}
    role="checkbox"
    selected={isSelected}
    aria-checked={isSelected}
    sx={sx}
  >
    {rowSelection && <TableCell padding="checkbox">
      <Checkbox checked={isSelected} onClick={onSelect} />
    </TableCell>}
    {columns?.map(v => {
      const { id, dataKey, format, props = {} } = v;
      const value = info[dataKey];
      return <TableCell key={id} align="center" sx={{
        height: 40,
        py: 0,
        fontSize: theme.typography.fontSize,
        fontWeight: 'inherit',
        whiteSpace: 'nowrap',
      }} {...props}>
        <Stack direction="row" spacing={1}
          sx={{ justifyContent: 'center', alignItems: 'center' }}>
          {(() => {
            if (id === '_action') return actions;
            if (format) return format(value, info, ...position);
            return <Typography noWrap sx={{ width: 'inherit', fontWeight: 'inherit' }}>{value}</Typography>
          })()}
        </Stack>
      </TableCell>
    })}
  </TableRow>
}