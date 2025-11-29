import { Component, EventEmitter, Input, Output,inject, effect, Signal, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';

import { signal } from '@angular/core';

import { SubSink } from 'subsink';
import { Observable, tap } from 'rxjs';

import { Budget, BudgetRecord } from '@app/model/finance/planning/budgets';

import { ShareBudgetModalComponent } from '../share-budget-modal/share-budget-modal.component';
import { CreateBudgetModalComponent } from '../create-budget-modal/create-budget-modal.component';
import { ChildBudgetsModalComponent } from '../../modals/child-budgets-modal/child-budgets-modal.component';

@Component({
  selector: 'app-budget-table',
  templateUrl: './budget-table.component.html',
  styleUrls: ['./budget-table.component.scss'],
})

export class BudgetTableComponent {

  @Input() budgets!: Signal<{ overview: BudgetRecord[], budgets: any[] }>;
  @Input() canPromote = false;

  @Output() doPromote: EventEmitter<void> = new EventEmitter();

  dataSource = new MatTableDataSource();

  displayedColumns: string[] = ['name', 'status', 'startYear', 'duration', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('sort', { static: true }) sort: MatSort;

  overviewBudgets = signal<BudgetRecord[]>([]);

  private dialog = inject(MatDialog);
  private router = inject(Router);

    constructor() {
    effect(() => {
      const data = this.budgets();

      if (!data) return;

      this.overviewBudgets.set(data.overview);

      // table data
      this.dataSource.data = data.budgets || [];
    });
  }


  /** 
 * Checks whether the user has access to a certain feature.
 * 
 * @TODO @IanOdhiambo9 - Please put proper access control architecture in place. 
 */
  access(requested:any) 
  {  
    switch (requested) {
      case 'view':
      case 'clone':
        return true; //budget.access.owner || budget.access.view || budget.access.edit;
      case 'edit':
        return true; // (budget.access.owner || budget.access.edit) && budget.status !== BudgetStatus.InUse && budget.status !== BudgetStatus.InUse;
    }
    return false;
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  filterAccountRecords(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  promote() {
    if (this.canPromote)
      this.doPromote.emit();
  }

  /** Open share screen to configure budget access. */
  openShareBudgetDialog(parent: Budget | false) {
    this.dialog.open(ShareBudgetModalComponent, {
      panelClass: 'no-pad-dialog',
      width: '600px',
      data: parent != null ? parent : false
    });
  }

  /** Open clone screen to clone and reconfigure budget. */
  openCloneBudgetDialog(parent: Budget | false) {
    this.dialog.open(CreateBudgetModalComponent, {
      height: 'fit-content',
      width: '600px',
      data: parent != null ? parent : false
    });
  }

  openChildBudgetDialog(parent : Budget) { 
    let children: any = this.overviewBudgets.find((budget) => budget.budget.id === parent.id)!?.children;
    children = children?.map((child) => child.budget)
    this.dialog.open(ChildBudgetsModalComponent, {
      height: 'fit-content',
      minWidth: '600px',
      data: {parent: parent, budgets: children}
    });
  }

  goToDetail(budgetId: string, action: string) {
    this.router.navigate(['budgets', budgetId, action]).then(() => this.dialog.closeAll());
  }

  deleteBudget(budget: Budget) {

  }

  translateStatus(status: number) {
    switch (status) {
      case 1:
        return 'BUDGET.STATUS.ACTIVE';
      case 0:
        return 'BUDGET.STATUS.DESIGN';
      case 9:
        return 'BUDGET.STATUS.NO-USE';
      case -1:
        return 'BUDGET.STATUS.DELETED';
      default:
        return '';
    }
  }
}
