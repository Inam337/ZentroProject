import { FilePlus2Icon, GrapeIcon } from 'lucide-react';

import { CommonIconNames, IconType } from './types';
import { HomeIcon } from './home.icon';
import { MenuIcon } from './menu.icon';
import { ArrowChevronRightIcon } from './arrow-chevron-right.icon';
import { BarChartIcon } from './bar-chart.icon';
import { CalenderIcon } from './calender.icon';
import { CheckboxIcon } from './checkbox.icon';
import { CheckMarkIcon } from './checkmark.icon';
import { ClockIcon } from './clock.icon';
import { CogIcon } from './cog.icon';
import { DashboardIcon } from './dashboard.icon';
import { DataIcon } from './data.icon';
import { DownloadIcon } from './download.icon';
import { EditIcon } from './edit.icon';
import { FeedbackIcon } from './feedback.icon';
import { FileIcon } from './file.icon';
import { FiltersIcon } from './filters.icon';
import { LanguageIcon } from './language.icon';
import { LogoutIcon } from './logout.icon';
import { NotificationIcon } from './notification.icon';
import { OverDueIcon } from './overdue.icon';
import { ReportIcon } from './report.icon';
import { ResolutionIcon } from './resolution.icon';
import { SearchIcon } from './search.icon';
import { SuspendIcon } from './suspend.icon';
import { UserIcon } from './user.icon';
import { UsersIcon } from './users.icon';
import { ViewIcon } from './view.icon';
import { WorldIcon } from './world.icon';
import { ArrowDownIcon } from './arrow-down.icon';
import { UserActiveIcon } from './user-active.icon';
import { UserBlockIcon } from './user-block.icon';
import { ComplaintCategoriesIcon } from './categories.icon';
import { OfficeIcon } from './office.icon';
import { RulesIcon } from './rules.icon';
import { DepartmentIcon } from './department.icon';
import { NotFoundIcon } from './not-found.icon';
import { PDFIcon } from './pdf.icon';
import { ArrowChevronLeftIcon } from './arrow-chevron-left.icon';
import { PersonalCardIcon } from './personal-card.icon';
import { MultiFileIcon } from './multi-file.icon';
import { PencilIcon } from './pencil.icon';
import { SingleFileIcon } from './single-file.icon';
import { TableNotificationIcon } from './table-notification.icon';
import { DateIcon } from './date.icon';
import { WarrantIcon } from './warrant.icon';
import { TrashIcon } from './trash.icon';
import { ForeignIcon } from './foreign.icon';
import { CitizenIcon } from './citizen.icon';
import { LoginUserIcon } from './login.user.icon';
import { RegisterUserIcon } from './register.user.icon';
import { SendIcon } from './send.icon';
import AttachmentIcon from './attachment.icon';
import { DatePickerIcon } from './date-picker.icon';
import { AttendanceIcon } from './attendance.icon';
import { DefaultPlaceHolderFileIcon } from './default-placeholder-file.icon';
import { JPEGIcon } from './jpeg.icon';
import { PNGIcon } from './png.icon';
import { ShowPasswordIcon } from './show-password.icon';
import { HidePasswordIcon } from './hide-password';
import { StarIcon } from './star.icon';
import { WarningIcon } from './warning.icon';
import { SirenIcon } from './siren.icon';
import { TickIcon } from './tick.icon';
import { CloseIcon } from './close.icon';
import { ReminderIcon } from './reminder.icon';
import { CirclePlusIcon } from './circle-plus.icon';
import { KeyIcon } from './key.icon';
import { OthersIcon } from './others.icon';
import { WrongThingIcon } from './wrong-thing.icon';
import { AvatarIcon } from './avatar.icon';
import { DefianceIcon } from './defiance.icon';
import { MarkClosedIcon } from './mark-closed.icon';
import { WordDocumentIcon } from './word-document.icon';
import { PDFDocumentIcon } from './pdf-document.icon';
import { FileTickIcon } from './file-tick.icon';
import { RefreshIcon } from './refresh.icon';

const iconComponents = {
  [CommonIconNames.HOME_ICON]: HomeIcon,
  [CommonIconNames.ORDERS_ICON]: HomeIcon,
  [CommonIconNames.PRODUCTS_ICON]: HomeIcon,
  [CommonIconNames.CATEGORIES_ICON]: HomeIcon,
  [CommonIconNames.STOCK_ICON]: HomeIcon,
  [CommonIconNames.REPORTS_ICON]: ReportIcon,
  [CommonIconNames.MENU_ICON]: MenuIcon,
  [CommonIconNames.ARROW_RIGHT_ICON]: ArrowChevronRightIcon,
  [CommonIconNames.BAR_CHART_ICON]: BarChartIcon,
  [CommonIconNames.CALENDER_ICON]: CalenderIcon,
  [CommonIconNames.CHECKBOX_ICON]: CheckboxIcon,
  [CommonIconNames.CHECK_MARK_ICON]: CheckMarkIcon,
  [CommonIconNames.CLOCK_ICON]: ClockIcon,
  [CommonIconNames.COG_ICON]: CogIcon,
  [CommonIconNames.DASHBOARD_ICON]: DashboardIcon,
  [CommonIconNames.DATA_ICON]: DataIcon,
  [CommonIconNames.DOWNLOAD_ICON]: DownloadIcon,
  [CommonIconNames.EDIT_ICON]: EditIcon,
  [CommonIconNames.FEEDBACK_ICON]: FeedbackIcon,
  [CommonIconNames.FILE_ICON]: FileIcon,
  [CommonIconNames.FILTERS_ICON]: FiltersIcon,
  [CommonIconNames.LANGUAGE_ICON]: LanguageIcon,
  [CommonIconNames.LOGOUT_ICON]: LogoutIcon,
  [CommonIconNames.NOTIFICATION_ICON]: NotificationIcon,
  [CommonIconNames.OVERDUE_ICON]: OverDueIcon,
  [CommonIconNames.REPORT_ICON]: ReportIcon,
  [CommonIconNames.RESOLUTION_ICON]: ResolutionIcon,
  [CommonIconNames.SEARCH_ICON]: SearchIcon,
  [CommonIconNames.SUSPEND_ICON]: SuspendIcon,
  [CommonIconNames.USER_ICON]: UserIcon,
  [CommonIconNames.USERS_ICON]: UsersIcon,
  [CommonIconNames.VIEW_ICON]: ViewIcon,
  [CommonIconNames.WORLD_ICON]: WorldIcon,
  [CommonIconNames.ARROW_DOWN_ICON]: ArrowDownIcon,
  [CommonIconNames.USER_ACTIVE_ICON]: UserActiveIcon,
  [CommonIconNames.USER_BLOCK_ICON]: UserBlockIcon,
  [CommonIconNames.COMPLAINT_CATEGORIES_ICON]: ComplaintCategoriesIcon,
  [CommonIconNames.OFFICE_ICON]: OfficeIcon,
  [CommonIconNames.RULES_ICON]: RulesIcon,
  [CommonIconNames.DEPARTMENT_ICON]: DepartmentIcon,
  [CommonIconNames.NOT_FOUND_ICON]: NotFoundIcon,
  [CommonIconNames.PDF_ICON]: PDFIcon,
  [CommonIconNames.ARROW_CHEVRON_RIGHT_ICON]: ArrowChevronRightIcon,
  [CommonIconNames.ARROW_CHEVRON_LEFT_ICON]: ArrowChevronLeftIcon,
  [CommonIconNames.WARRANT_ICON]: WarrantIcon,
  [CommonIconNames.MULTI_FILE_ICON]: MultiFileIcon,
  [CommonIconNames.PENCIL_ICON]: PencilIcon,
  [CommonIconNames.SINGLE_FILE_ICON]: SingleFileIcon,
  [CommonIconNames.TABLE_NOTIFICATION_ICON]: TableNotificationIcon,
  [CommonIconNames.TRASH_ICON]: TrashIcon,
  [CommonIconNames.DATE_ICON]: DateIcon,
  [CommonIconNames.PERSONAL_CARD_ICON]: PersonalCardIcon,
  [CommonIconNames.FOREIGN_ICON]: ForeignIcon,
  [CommonIconNames.CITIZEN_ICON]: CitizenIcon,
  [CommonIconNames.LOGIN_USER_ICON]: LoginUserIcon,
  [CommonIconNames.REGISTER_USER_ICON]: RegisterUserIcon,
  [CommonIconNames.ATTACHMENT_ICON]: AttachmentIcon,
  [CommonIconNames.SEND_ICON]: SendIcon,
  [CommonIconNames.GRAPH_ICON]: GrapeIcon,
  [CommonIconNames.DATE_PICKER_ICON]: DatePickerIcon,
  [CommonIconNames.ATTENDANCE_ICON]: AttendanceIcon,
  [CommonIconNames.DEFAULT_PLACEHOLDER_FILE_ICON]: DefaultPlaceHolderFileIcon,
  [CommonIconNames.JPEG_ICON]: JPEGIcon,
  [CommonIconNames.PNG_ICON]: PNGIcon,
  [CommonIconNames.SHOW_PASSWORD_ICON]: ShowPasswordIcon,
  [CommonIconNames.HIDE_PASSWORD_ICON]: HidePasswordIcon,
  [CommonIconNames.FILE_PLUS_ICON]: FilePlus2Icon,
  [CommonIconNames.STAR_ICON]: StarIcon,
  [CommonIconNames.WARNING_ICON]: WarningIcon,
  [CommonIconNames.REMINDER_ICON]: ReminderIcon,
  [CommonIconNames.SIREN_ICON]: SirenIcon,
  [CommonIconNames.TICK_ICON]: TickIcon,
  [CommonIconNames.CLOSE_ICON]: CloseIcon,
  [CommonIconNames.CIRCLE_PLUS_ICON]: CirclePlusIcon,
  [CommonIconNames.KEY_ICON]: KeyIcon,
  [CommonIconNames.OTHERS_ICON]: OthersIcon,
  [CommonIconNames.WRONG_THING_ICON]: WrongThingIcon,
  [CommonIconNames.AVATAR_ICON]: AvatarIcon,
  [CommonIconNames.DEFIANCE_ICON]: DefianceIcon,
  [CommonIconNames.MARK_CLOSED_ICON]: MarkClosedIcon,
  [CommonIconNames.PDF_DOCUMENT_ICON]: PDFDocumentIcon,
  [CommonIconNames.WORD_DOCUMENT_ICON]: WordDocumentIcon,
  [CommonIconNames.FILE_TICK_ICON]: FileTickIcon,
  [CommonIconNames.REFRESH_ICON]: RefreshIcon,

};

interface CommonIconProps extends IconType {
  name: CommonIconNames;
}

export const CommonIcon: React.FC<CommonIconProps> = ({ name, ...props }) => {
  const IconComponent = iconComponents[name];

  return IconComponent ? <IconComponent {...props} /> : null;
};
