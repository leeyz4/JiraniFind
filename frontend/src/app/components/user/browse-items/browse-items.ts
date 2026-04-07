import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserSideNav } from '../../../shared/components/user-side-nav/user-side-nav';
import { Auth } from '../../../core/services/auth';
import { Api, BrowseItem, ItemType } from '../../../core/services/api';
import { UiToast } from '../../../core/services/ui-toast';

@Component({
  selector: 'app-browse-items',
  imports: [UserSideNav, FormsModule],
  templateUrl: './browse-items.html',
  styleUrls: ['./browse-items.css'],
})
export class BrowseItems implements OnInit {
  private readonly auth = inject(Auth);
  private readonly api = inject(Api);
  private readonly uiToast = inject(UiToast);
  protected readonly userName = computed(
    () => this.auth.currentUser()?.name ?? 'User',
  );

  protected readonly loading = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly allItems = signal<BrowseItem[]>([]);
  protected readonly searchKeyword = signal('');
  protected readonly searchCategory = signal('');
  protected readonly searchLocation = signal('');
  protected readonly showLost = signal(true);
  protected readonly showFound = signal(true);
  protected readonly claimModalOpen = signal(false);
  protected readonly claimingItem = signal<BrowseItem | null>(null);
  protected readonly claimMessage = signal('');
  protected readonly claimProofFileName = signal('');
  protected readonly claimProofDataUrl = signal('');
  protected readonly claimSubmitting = signal(false);

  ngOnInit(): void {
    this.loadItems();
  }

  protected loadItems(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.api
      .browseItems({
        keyword: this.searchKeyword().trim() || undefined,
        category: this.searchCategory().trim() || undefined,
        location: this.searchLocation().trim() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.allItems.set([...res.lostItems, ...res.foundItems]);
        },
        error: () => {
          this.loading.set(false);
          this.errorMessage.set('Unable to load approved items right now.');
        },
      });
  }

  protected setKeyword(value: string): void {
    this.searchKeyword.set(value);
    this.loadItems();
  }

  protected setCategory(value: string): void {
    this.searchCategory.set(value);
    this.loadItems();
  }

  protected setLocation(value: string): void {
    this.searchLocation.set(value);
    this.loadItems();
  }

  protected toggleLost(value: boolean): void {
    this.showLost.set(value);
  }

  protected toggleFound(value: boolean): void {
    this.showFound.set(value);
  }

  protected resetFilters(): void {
    this.searchKeyword.set('');
    this.searchCategory.set('');
    this.searchLocation.set('');
    this.showLost.set(true);
    this.showFound.set(true);
    this.loadItems();
  }

  protected filteredItems(): BrowseItem[] {
    return this.allItems().filter((item) => {
      const type: ItemType = item.dateFound ? 'found' : 'lost';
      if (type === 'lost' && !this.showLost()) return false;
      if (type === 'found' && !this.showFound()) return false;
      return true;
    });
  }

  protected itemType(item: BrowseItem): ItemType {
    return item.dateFound ? 'found' : 'lost';
  }

  protected itemDate(item: BrowseItem): string {
    return item.dateFound ?? item.dateLost ?? '';
  }

  protected openClaim(item: BrowseItem): void {
    this.claimingItem.set(item);
    this.claimMessage.set('');
    this.claimProofFileName.set('');
    this.claimProofDataUrl.set('');
    this.claimModalOpen.set(true);
  }

  protected closeClaim(): void {
    this.claimModalOpen.set(false);
    this.claimingItem.set(null);
  }

  protected setClaimMessage(value: string): void {
    this.claimMessage.set(value);
  }

  protected async onClaimProofSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.claimProofFileName.set('');
    this.claimProofDataUrl.set('');
    if (!file) return;
    this.claimProofFileName.set(file.name);
    const data = await this.fileToDataUrl(file);
    this.claimProofDataUrl.set(data);
  }

  protected submitClaim(): void {
    const item = this.claimingItem();
    if (!item) return;
    const messageBase = this.claimMessage().trim();
    if (!messageBase) {
      this.uiToast.show('Please provide your claim details.', 'error');
      return;
    }
    const proof = this.claimProofDataUrl();
    const message = proof
      ? `${messageBase}\nProof file: ${this.claimProofFileName()}\n${proof}`
      : messageBase;
    this.claimSubmitting.set(true);
    this.api.createClaim({ itemId: item.id, message }).subscribe({
      next: () => {
        this.claimSubmitting.set(false);
        this.uiToast.show(
          'Claim submitted. Admin will review your proof.',
          'success',
        );
        this.closeClaim();
      },
      error: (err: { error?: { message?: string | string[] } }) => {
        this.claimSubmitting.set(false);
        const msg = err.error?.message;
        const text = Array.isArray(msg) ? msg.join(', ') : msg;
        this.uiToast.show(text ?? 'Failed to submit claim.', 'error');
      },
    });
  }

  private async fileToDataUrl(file: File): Promise<string> {
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(new Error('Could not read selected file'));
      reader.readAsDataURL(file);
    });
  }
}
