import { memo } from 'react';
import { CirclePlusIcon, PencilIcon, SendIcon } from 'lucide-react';

import { CommonIconNames, IconProps } from './types';
import { HomeIcon } from './home.icon';
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
import { ArrowChevronRightIcon } from './arrow-chevron-right.icon';
import { PersonalCardIcon } from './personal-card.icon';
import { MultiFileIcon } from './multi-file.icon';
import { SingleFileIcon } from './single-file.icon';
import { TableNotificationIcon } from './table-notification.icon';
import { DateIcon } from './date.icon';
import { WarrantIcon } from './warrant.icon';
import { TrashIcon } from './trash.icon';
import { ForeignIcon } from './foreign.icon';
import { CitizenIcon } from './citizen.icon';
import { LoginUserIcon } from './login.user.icon';
import { RegisterUserIcon } from './register.user.icon';
import { GraphIcon } from './graph.icon';
import AttachmentIcon from './attachment.icon';
import { DatePickerIcon } from './date-picker.icon';
import { AttendanceIcon } from './attendance.icon';
import { DefaultPlaceHolderFileIcon } from './default-placeholder-file.icon';
import { JPEGIcon } from './jpeg.icon';
import { PNGIcon } from './png.icon';
import { ShowPasswordIcon } from './show-password.icon';
import { HidePasswordIcon } from './hide-password';
import { FilePlusIcon } from './file-plus.icon';
import { StarIcon } from './star.icon';
import { WarningIcon } from './warning.icon';
import { ReminderIcon } from './reminder.icon';
import { SirenIcon } from './siren.icon';
import { TickIcon } from './tick.icon';
import { RefreshIcon } from './refresh.icon';
import { CloseIcon } from './close.icon';
import { KeyIcon } from './key.icon';
import { OthersIcon } from './others.icon';
import { WrongThingIcon } from './wrong-thing.icon';
import { AvatarIcon } from './avatar.icon';
import { MenuIcon } from './menu.icon';
import { DefianceIcon } from './defiance.icon';
import { MarkClosedIcon } from './mark-closed.icon';
import { PDFDocumentIcon } from './pdf-document.icon';
import { WordDocumentIcon } from './word-document.icon';
import { FileTickIcon } from './file-tick.icon';
import { LogsIcon } from './logs.icon';
import { GenerativeAIIcon } from './generative-ai.icon';
import { PrinterIcon } from './printer.icon';

const CommonIconComponent: React.FC<IconProps> = (props) => {
  const { name } = props;

  switch (name) {
    case CommonIconNames.HOME_ICON:
      return <HomeIcon {...props} />;
    case CommonIconNames.BAR_CHART_ICON:
      return <BarChartIcon {...props} />;
    case CommonIconNames.CALENDER_ICON:
      return <CalenderIcon {...props} />;
    case CommonIconNames.CHECKBOX_ICON:
      return <CheckboxIcon {...props} />;
    case CommonIconNames.CHECK_MARK_ICON:
      return <CheckMarkIcon {...props} />;
    case CommonIconNames.CLOCK_ICON:
      return <ClockIcon {...props} />;
    case CommonIconNames.COG_ICON:
      return <CogIcon {...props} />;
    case CommonIconNames.DASHBOARD_ICON:
      return <DashboardIcon {...props} />;
    case CommonIconNames.DOWNLOAD_ICON:
      return <DownloadIcon {...props} />;
    case CommonIconNames.EDIT_ICON:
      return <EditIcon {...props} />;
    case CommonIconNames.DATA_ICON:
      return <DataIcon {...props} />;
    case CommonIconNames.FEEDBACK_ICON:
      return <FeedbackIcon {...props} />;
    case CommonIconNames.FILE_ICON:
      return <FileIcon {...props} />;
    case CommonIconNames.FILTERS_ICON:
      return <FiltersIcon {...props} />;
    case CommonIconNames.LANGUAGE_ICON:
      return <LanguageIcon {...props} />;
    case CommonIconNames.LOGOUT_ICON:
      return <LogoutIcon {...props} />;
    case CommonIconNames.NOTIFICATION_ICON:
      return <NotificationIcon {...props} />;
    case CommonIconNames.OVERDUE_ICON:
      return <OverDueIcon {...props} />;
    case CommonIconNames.REPORT_ICON:
      return <ReportIcon {...props} />;
    case CommonIconNames.RESOLUTION_ICON:
      return <ResolutionIcon {...props} />;
    case CommonIconNames.SEARCH_ICON:
      return <SearchIcon {...props} />;
    case CommonIconNames.SUSPEND_ICON:
      return <SuspendIcon {...props} />;
    case CommonIconNames.USER_ICON:
      return <UserIcon {...props} />;
    case CommonIconNames.USERS_ICON:
      return <UsersIcon {...props} />;
    case CommonIconNames.VIEW_ICON:
      return <ViewIcon {...props} />;
    case CommonIconNames.WORLD_ICON:
      return <WorldIcon {...props} />;
    case CommonIconNames.ARROW_DOWN_ICON:
      return <ArrowDownIcon {...props} />;
    case CommonIconNames.USER_ACTIVE_ICON:
      return <UserActiveIcon {...props} />;
    case CommonIconNames.USER_BLOCK_ICON:
      return <UserBlockIcon {...props} />;
    case CommonIconNames.COMPLAINT_CATEGORIES_ICON:
      return <ComplaintCategoriesIcon {...props} />;
    case CommonIconNames.OFFICE_ICON:
      return <OfficeIcon {...props} />;
    case CommonIconNames.RULES_ICON:
      return <RulesIcon {...props} />;
    case CommonIconNames.DEPARTMENT_ICON:
      return <DepartmentIcon {...props} />;
    case CommonIconNames.NOT_FOUND_ICON:
      return <NotFoundIcon {...props} />;
    case CommonIconNames.PDF_ICON:
      return <PDFIcon {...props} />;
    case CommonIconNames.ARROW_CHEVRON_LEFT_ICON:
      return <ArrowChevronLeftIcon {...props} />;
    case CommonIconNames.ARROW_CHEVRON_RIGHT_ICON:
      return <ArrowChevronRightIcon {...props} />;
    case CommonIconNames.WARRANT_ICON:
      return <WarrantIcon {...props} />;
    case CommonIconNames.MULTI_FILE_ICON:
      return <MultiFileIcon {...props} />;
    case CommonIconNames.PENCIL_ICON:
      return <PencilIcon {...props} />;
    case CommonIconNames.SINGLE_FILE_ICON:
      return <SingleFileIcon {...props} />;
    case CommonIconNames.TABLE_NOTIFICATION_ICON:
      return <TableNotificationIcon {...props} />;
    case CommonIconNames.TRASH_ICON:
      return <TrashIcon {...props} />;
    case CommonIconNames.DATE_ICON:
      return <DateIcon {...props} />;
    case CommonIconNames.PERSONAL_CARD_ICON:
      return <PersonalCardIcon {...props} />;
    case CommonIconNames.FOREIGN_ICON:
      return <ForeignIcon {...props} />;
    case CommonIconNames.CITIZEN_ICON:
      return <CitizenIcon {...props} />;
    case CommonIconNames.LOGIN_USER_ICON:
      return <LoginUserIcon {...props} />;
    case CommonIconNames.REGISTER_USER_ICON:
      return <RegisterUserIcon {...props} />;
    case CommonIconNames.ATTACHMENT_ICON:
      return <AttachmentIcon {...props} />;
    case CommonIconNames.SEND_ICON:
      return <SendIcon {...props} />;
    case CommonIconNames.GRAPH_ICON:
      return <GraphIcon {...props} />;
    case CommonIconNames.DATE_PICKER_ICON:
      return <DatePickerIcon {...props} />;
    case CommonIconNames.ATTENDANCE_ICON:
      return <AttendanceIcon {...props} />;
    case CommonIconNames.DEFAULT_PLACEHOLDER_FILE_ICON:
      return <DefaultPlaceHolderFileIcon {...props} />;
    case CommonIconNames.JPEG_ICON:
      return <JPEGIcon {...props} />;
    case CommonIconNames.PNG_ICON:
      return <PNGIcon {...props} />;
    case CommonIconNames.SHOW_PASSWORD_ICON:
      return <ShowPasswordIcon {...props} />;
    case CommonIconNames.HIDE_PASSWORD_ICON:
      return <HidePasswordIcon {...props} />;
    case CommonIconNames.FILE_PLUS_ICON:
      return <FilePlusIcon {...props} />;
    case CommonIconNames.STAR_ICON:
      return <StarIcon {...props} />;
    case CommonIconNames.WARNING_ICON:
      return <WarningIcon {...props} />;
    case CommonIconNames.REMINDER_ICON:
      return <ReminderIcon {...props} />;
    case CommonIconNames.SIREN_ICON:
      return <SirenIcon {...props} />;
    case CommonIconNames.TICK_ICON:
      return <TickIcon {...props} />;
    case CommonIconNames.REFRESH_ICON:
      return <RefreshIcon {...props} />;
    case CommonIconNames.CLOSE_ICON:
      return <CloseIcon {...props} />;
    case CommonIconNames.CIRCLE_PLUS_ICON:
      return <CirclePlusIcon {...props} />;
    case CommonIconNames.KEY_ICON:
      return <KeyIcon {...props} />;
    case CommonIconNames.OTHERS_ICON:
      return <OthersIcon {...props} />;
    case CommonIconNames.WRONG_THING_ICON:
      return <WrongThingIcon {...props} />;
    case CommonIconNames.AVATAR_ICON:
      return <AvatarIcon {...props} />;
    case CommonIconNames.MENU_ICON:
      return <MenuIcon {...props} />;
    case CommonIconNames.DEFIANCE_ICON:
      return <DefianceIcon {...props} />;
    case CommonIconNames.MARK_CLOSED_ICON:
      return <MarkClosedIcon {...props} />;
    case CommonIconNames.PDF_DOCUMENT_ICON:
      return <PDFDocumentIcon {...props} />;
    case CommonIconNames.WORD_DOCUMENT_ICON:
      return <WordDocumentIcon {...props} />;
    case CommonIconNames.FILE_TICK_ICON:
      return <FileTickIcon {...props} />;
    case CommonIconNames.LOGS_ICON:
      return <LogsIcon {...props} />;
    case CommonIconNames.GENERATIVE_AI_ICON:
      return <GenerativeAIIcon {...props} />;
    case CommonIconNames.PRINT_ICON:
      return <PrinterIcon {...props} />;
    default:
      return null;
  }
};

CommonIconComponent.displayName = 'CommonIcon';

export const CommonIcon = memo(CommonIconComponent);
